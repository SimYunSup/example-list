// https://github.com/facebook/lexical/blob/v0.13.1/packages/lexical-playground/src/plugins/TableActionMenuPlugin/index.tsx

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ElementNode, LexicalEditor } from "lexical";
/* ADD: Custom Components */
import type { Color } from "@react-spectrum/color";
/* END: Custom Components */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useLexicalEditable from "@lexical/react/useLexicalEditable";
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $unmergeCell,
  getTableObserverFromTableElement,
  HTMLTableElementWithWithTableSelectionState,
  INSERT_TABLE_COMMAND,
  TableCellHeaderStates,
  TableCellNode,
  TableRowNode,
  TableSelection,
} from "@lexical/table";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  /* ADD: Custom Components */
  COMMAND_PRIORITY_LOW,
  /* END: Custom Components */
} from "lexical";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ADD: payload system */
import { useTranslation } from "react-i18next";

// import useModal from '../../hooks/useModal';
//import ColorPicker from '../../ui/ColorPicker';
/* END: payload system */
/* ADD: Custom Components */
import type { ModalProps } from "./Modal";
import { mergeRegister } from "@lexical/utils";
import { ColorArea, ColorSlider, parseColor } from "@react-spectrum/color";
import { Modal, ModalProvider, useModal } from "./Modal";
import { TOGGLE_INSERT_TABLE_MODAL_COMMAND } from "../../command/modal";
import "./index.css";
import { AdobeProvider } from "../../../components/adobe";
/* END: Custom Components */

function computeSelectionCount(selection: TableSelection): {
  columns: number;
  rows: number;
} {
  const selectionShape = selection.getShape();
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1,
  };
}

// This is important when merging cells as there is no good way to re-merge weird shapes (a result
// of selecting merged cells and non-merged)
function isTableSelectionRectangular(selection: TableSelection): boolean {
  const nodes = selection.getNodes();
  const currentRows: Array<number> = [];
  let currentRow = null;
  let expectedColumns = null;
  let currentColumns = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if ($isTableCellNode(node)) {
      const row = node.getParentOrThrow();
      if (!$isTableRowNode(row)) {
        throw new Error("Expected CellNode to have a RowNode parent");
      }
      if (currentRow !== row) {
        if (expectedColumns !== null && currentColumns !== expectedColumns) {
          return false;
        }
        if (currentRow !== null) {
          expectedColumns = currentColumns;
        }
        currentRow = row;
        currentColumns = 0;
      }
      const colSpan = node.__colSpan;
      for (let j = 0; j < colSpan; j++) {
        if (currentRows[currentColumns + j] === undefined) {
          currentRows[currentColumns + j] = 0;
        }
        currentRows[currentColumns + j] += node.__rowSpan;
      }
      currentColumns += colSpan;
    }
  }
  return (
    (expectedColumns === null || currentColumns === expectedColumns) &&
    currentRows.every((v) => v === currentRows[0])
  );
}

function $canUnmerge(): boolean {
  const selection = $getSelection();
  if (
    ($isRangeSelection(selection) && !selection.isCollapsed()) ||
    ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
    (!$isRangeSelection(selection) && !$isTableSelection(selection))
  ) {
    return false;
  }
  const [cell] = $getNodeTriplet(selection.anchor);
  return cell.__colSpan > 1 || cell.__rowSpan > 1;
}

function $cellContainsEmptyParagraph(cell: TableCellNode): boolean {
  if (cell.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = cell.getFirstChildOrThrow();
  if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
    return false;
  }
  return true;
}

function $selectLastDescendant(node: ElementNode): void {
  const lastDescendant = node.getLastDescendant();
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select();
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd();
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext();
  }
}

function currentCellBackgroundColor(editor: LexicalEditor): null | string {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const [cell] = $getNodeTriplet(selection.anchor);
      if ($isTableCellNode(cell)) {
        return cell.getBackgroundColor();
      }
    }
    return null;
  });
}

type TableCellActionMenuProps = Readonly<{
  onClose: () => void;
  contextRef: { current: null | HTMLElement };
  setIsMenuOpen: (isOpen: boolean) => void;
  // ADD: delegation to Popup Components
  // showColorPickerModal: (
  //   title: string,
  //   showModal: (onClose: () => void) => JSX.Element,
  // ) => void;
  // END: delegation to Popup Components
  tableCellNode: TableCellNode;
  cellMerge: boolean;
}>;

function TableActionMenu({
  onClose,
  tableCellNode: _tableCellNode,
  setIsMenuOpen,
  contextRef,
  // showColorPickerModal,
  cellMerge,
}: TableCellActionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  });
  const [canMergeCells, setCanMergeCells] = useState(false);
  const [canUnmergeCell, setCanUnmergeCell] = useState(false);
  /* ADD: Custom Components */
  const { setModal } = useModal();
  const [backgroundColor, setBackgroundColor] = useState(
    () => currentCellBackgroundColor(editor) || "rgba(0, 0, 0, 0)",
  );
  const colorValue = useMemo(
    () => parseColor(backgroundColor),
    [backgroundColor],
  );
  const onColorChange = (color: Color) => {
    const colorString = color.toString("rgba");
    setBackgroundColor(colorString);
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor);
        if ($isTableCellNode(cell)) {
          cell.setBackgroundColor(colorString);
        }

        if ($isTableSelection(selection)) {
          const nodes = selection.getNodes();

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if ($isTableCellNode(node)) {
              node.setBackgroundColor(colorString);
            }
          }
        }
      }
    });
    onClose();
  };
  /* END: Custom Components */
  /* ADD: i18n */
  const { t } = useTranslation("table");
  /* END: i18n */

  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, (nodeMutations) => {
      const nodeUpdated =
        nodeMutations.get(tableCellNode.getKey()) === "updated";

      if (nodeUpdated) {
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest());
        });
        setBackgroundColor(currentCellBackgroundColor(editor) || "");
      }
    });
  }, [editor, tableCellNode]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      // Merge cells
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection);
        updateSelectionCounts(computeSelectionCount(selection));
        setCanMergeCells(
          isTableSelectionRectangular(selection) &&
            (currentSelectionCounts.columns > 1 ||
              currentSelectionCounts.rows > 1),
        );
      }
      // Unmerge cell
      setCanUnmergeCell($canUnmerge());
    });
  }, [editor]);

  useEffect(() => {
    const menuButtonElement = contextRef.current;
    const dropDownElement = dropDownRef.current;
    const rootElement = editor.getRootElement();

    if (
      menuButtonElement != null &&
      dropDownElement != null &&
      rootElement != null
    ) {
      const rootEleRect = rootElement.getBoundingClientRect();
      const menuButtonRect = menuButtonElement.getBoundingClientRect();
      dropDownElement.style.opacity = "1";
      const dropDownElementRect = dropDownElement.getBoundingClientRect();
      const margin = 5;
      let leftPosition = menuButtonRect.right + margin;
      if (
        leftPosition + dropDownElementRect.width > window.innerWidth ||
        leftPosition + dropDownElementRect.width > rootEleRect.right
      ) {
        const position =
          menuButtonRect.left - dropDownElementRect.width - margin;
        leftPosition = (position < 0 ? margin : position) + window.pageXOffset;
      }
      dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`;

      let topPosition = menuButtonRect.top;
      if (topPosition + dropDownElementRect.height > window.innerHeight) {
        const position = menuButtonRect.bottom - dropDownElementRect.height;
        topPosition = (position < 0 ? margin : position) + window.pageYOffset;
      }
      dropDownElement.style.top = `${topPosition + +window.pageYOffset}px`;
    }
  }, [contextRef, dropDownRef, editor]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropDownRef.current != null &&
        contextRef.current != null &&
        !dropDownRef.current.contains(event.target as Node) &&
        !contextRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, [setIsMenuOpen, contextRef]);

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        const tableElement = editor.getElementByKey(
          tableNode.getKey(),
        ) as HTMLTableElementWithWithTableSelectionState;

        if (!tableElement) {
          throw new Error("Expected to find tableElement in DOM");
        }

        const tableSelection = getTableObserverFromTableElement(tableElement);
        if (tableSelection !== null) {
          tableSelection.clearHighlight();
        }

        tableNode.markDirty();
        updateTableCellNode(tableCellNode.getLatest());
      }

      const rootNode = $getRoot();
      rootNode.selectStart();
    });
  }, [editor, tableCellNode]);

  const mergeTableCellsAtSelection = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isTableSelection(selection)) {
        const { columns, rows } = computeSelectionCount(selection);
        const nodes = selection.getNodes();
        let firstCell: null | TableCellNode = null;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if ($isTableCellNode(node)) {
            if (firstCell === null) {
              node.setColSpan(columns).setRowSpan(rows);
              firstCell = node;
              const isEmpty = $cellContainsEmptyParagraph(node);
              let firstChild;
              if (
                isEmpty &&
                $isParagraphNode((firstChild = node.getFirstChild()))
              ) {
                firstChild.remove();
              }
            } else if ($isTableCellNode(firstCell)) {
              const isEmpty = $cellContainsEmptyParagraph(node);
              if (!isEmpty) {
                firstCell.append(...node.getChildren());
              }
              node.remove();
            }
          }
        }
        if (firstCell !== null) {
          if (firstCell.getChildrenSize() === 0) {
            firstCell.append($createParagraphNode());
          }
          $selectLastDescendant(firstCell);
        }
        onClose();
      }
    });
  };

  const unmergeTableCellsAtSelection = () => {
    editor.update(() => {
      $unmergeCell();
    });
  };

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        $insertTableRow__EXPERIMENTAL(shouldInsertAfter);
        onClose();
      });
    },
    [editor, onClose],
  );

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.columns; i++) {
          $insertTableColumn__EXPERIMENTAL(shouldInsertAfter);
        }
        onClose();
      });
    },
    [editor, onClose, selectionCounts.columns],
  );

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL();
      onClose();
    });
  }, [editor, onClose]);

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL();
      onClose();
    });
  }, [editor, onClose]);

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error("Expected table cell to be inside of table row.");
      }

      const tableRow = tableRows[tableRowIndex];

      if (!$isTableRowNode(tableRow)) {
        throw new Error("Expected table row");
      }

      tableRow.getChildren().forEach((tableCell) => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error("Expected table cell");
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW);
      });

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex =
        $getTableColumnIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren<TableRowNode>();
      const maxRowsLength = Math.max(
        ...tableRows.map((row) => row.getChildren().length),
      );

      if (tableColumnIndex >= maxRowsLength || tableColumnIndex < 0) {
        throw new Error("Expected table cell to be inside of table row.");
      }

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r];

        if (!$isTableRowNode(tableRow)) {
          throw new Error("Expected table row");
        }

        const tableCells = tableRow.getChildren();
        if (tableColumnIndex >= tableCells.length) {
          // if cell is outside of bounds for the current row (for example various merge cell cases) we shouldn't highlight it
          continue;
        }

        const tableCell = tableCells[tableColumnIndex];

        if (!$isTableCellNode(tableCell)) {
          throw new Error("Expected table cell");
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
      }

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  /* ADD: Change to Custom Components */
  // const handleCellBackgroundColor = useCallback(
  //   (value: string) => {
  //     editor.update(() => {
  //       const selection = $getSelection();
  //       if ($isRangeSelection(selection) || $isTableSelection(selection)) {
  //         const [cell] = $getNodeTriplet(selection.anchor);
  //         if ($isTableCellNode(cell)) {
  //           cell.setBackgroundColor(value);
  //         }

  //         if ($isTableSelection(selection)) {
  //           const nodes = selection.getNodes();

  //           for (let i = 0; i < nodes.length; i++) {
  //             const node = nodes[i];
  //             if ($isTableCellNode(node)) {
  //               node.setBackgroundColor(value);
  //             }
  //           }
  //         }
  //       }
  //     });
  //   },
  //   [editor],
  // );
  const withOnClose = (callback: () => void) => {
    return () => {
      onClose();
      callback();
    };
  };
  let mergeCellbutton: null | JSX.Element = null;
  if (cellMerge) {
    if (canMergeCells) {
      mergeCellbutton = (
        <button
          type="button"
          className="item"
          onClick={withOnClose(mergeTableCellsAtSelection)}
          data-test-id="table-merge-cells"
        >
          {t("mergeCell")}
        </button>
      );
    } else if (canUnmergeCell) {
      mergeCellbutton = (
        <button
          type="button"
          className="item"
          onClick={withOnClose(unmergeTableCellsAtSelection)}
          data-test-id="table-unmerge-cells"
        >
          {t("unmergeCell")}
        </button>
      );
    }
  }

  return createPortal(
    <div
      className="dropdown"
      onClick={(e) => {
        e.stopPropagation();
      }}
      ref={dropDownRef}
    >
      {mergeCellbutton}
      <button
        type="button"
        className="item"
        onClick={() => {
          onClose();
          setModal(() => (props: ModalProps) => {
            const [tempColorValue, setTempColorValue] = useState(() => colorValue);
            const onTempColorChange = (color: Color) => {
              console.log(color)
              setTempColorValue(color);
            }
            const onSubmit = () => {
              onColorChange(tempColorValue);
              props.close();
            }

            return (
              <AdobeProvider>
                <div className="form">
                  <ColorArea
                    colorSpace="hsb"
                    xChannel="saturation"
                    yChannel="brightness"
                    value={tempColorValue}
                    onChange={onTempColorChange}
                  />
                  <ColorSlider
                    colorSpace="hsb"
                    channel="hue"
                    orientation="horizontal"
                    value={tempColorValue}
                    onChange={onTempColorChange}
                  />
                  <ColorSlider
                    channel="alpha"
                    orientation="horizontal"
                    value={tempColorValue}
                    onChange={onTempColorChange}
                  />
                  <div className="row">
                    <button
                      type="button"
                      className="button"
                      onClick={onSubmit}
                    >
                      {t("table:submit")}
                    </button>
                    <button
                      type="button"
                      className="button"
                      onClick={props.close}
                    >
                      {t("table:close")}
                    </button>
                  </div>
                </div>
              </AdobeProvider>
            );
          })
        }}
        data-test-id="table-background-color"
      >
        <span className="text">{t("backgroundColor")}</span>
      </button>
      <hr />
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => insertTableRowAtSelection(false))}
        data-test-id="table-insert-row-above"
      >
        <span className="text">
          {t("insertAbove", {
            target:
              selectionCounts.rows === 1
                ? t("row")
                : `${selectionCounts.rows} ${t("rows")}`,
          })}
        </span>
      </button>
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => insertTableRowAtSelection(true))}
        data-test-id="table-insert-row-below"
      >
        <span className="text">
          {t("insertBelow", {
            target:
              selectionCounts.rows === 1
                ? t("row")
                : `${selectionCounts.rows} ${t("rows")}`,
          })}
        </span>
      </button>
      <hr />
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => insertTableColumnAtSelection(false))}
        data-test-id="table-insert-column-before"
      >
        <span className="text">
          {t("insertLeft", {
            target:
              selectionCounts.rows === 1
                ? t("column")
                : `${selectionCounts.rows} ${t("columns")}`,
          })}
        </span>
      </button>
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => insertTableColumnAtSelection(true))}
        data-test-id="table-insert-column-after"
      >
        <span className="text">
          {t("insertRight", {
            target:
              selectionCounts.rows === 1
                ? t("column")
                : `${selectionCounts.rows} ${t("columns")}`,
          })}
        </span>
      </button>
      <hr />
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => deleteTableColumnAtSelection())}
        data-test-id="table-delete-columns"
      >
        <span className="text">
          {t("delete")} {t("column")}
        </span>
      </button>
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => deleteTableRowAtSelection())}
        data-test-id="table-delete-rows"
      >
        <span className="text">
          {t("delete")} {t("row")}
        </span>
      </button>
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => deleteTableAtSelection())}
        data-test-id="table-delete"
      >
        <span className="text">
          {t("delete")} {t("table")}
        </span>
      </button>
      <hr />
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => toggleTableRowIsHeader())}
      >
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.ROW) ===
          TableCellHeaderStates.ROW
            ? t("remove")
            : t("add")}{" "}
          {t("row")} {t("header")}
        </span>
      </button>
      <button
        type="button"
        className="item"
        onClick={withOnClose(() => toggleTableColumnIsHeader())}
        data-test-id="table-column-header"
      >
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.ROW) ===
          TableCellHeaderStates.ROW
            ? t("remove")
            : t("add")}{" "}
          {t("column")} {t("header")}
        </span>
      </button>
    </div>,
    document.body,
  );
  /* END: Change to Custom Components */
}

function TableCellActionMenuContainer({
  anchorElem,
  cellMerge,
}: {
  anchorElem: HTMLElement;
  cellMerge: boolean;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(
    null,
  );

  /* ADD: Custom Components */
  // const [colorPickerModal, showColorPickerModal] = useModal();
  /* END: Custom Components */

  const moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (selection == null || menu == null) {
      setTableMenuCellNode(null);
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      );

      if (tableCellNodeFromSelection == null) {
        setTableMenuCellNode(null);
        return;
      }

      const tableCellParentNodeDOM = editor.getElementByKey(
        tableCellNodeFromSelection.getKey(),
      );

      if (tableCellParentNodeDOM == null) {
        setTableMenuCellNode(null);
        return;
      }

      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if (!activeElement) {
      setTableMenuCellNode(null);
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        moveMenu();
      });
    });
  });

  useEffect(() => {
    const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null;

    if (menuButtonDOM != null && tableCellNode != null) {
      const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());

      if (tableCellNodeDOM != null) {
        const tableCellRect = tableCellNodeDOM.getBoundingClientRect();
        const menuRect = menuButtonDOM.getBoundingClientRect();
        const anchorRect = anchorElem.getBoundingClientRect();

        const top = tableCellRect.top - anchorRect.top + 4;
        const left =
          tableCellRect.right - menuRect.width - 10 - anchorRect.left;

        menuButtonDOM.style.opacity = "1";
        menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`;
      } else {
        menuButtonDOM.style.opacity = "0";
        menuButtonDOM.style.transform = "translate(-10000px, -10000px)";
      }
    }
  }, [menuButtonRef, tableCellNode, editor, anchorElem]);

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    if (prevTableCellDOM.current !== tableCellNode) {
      setIsMenuOpen(false);
    }

    prevTableCellDOM.current = tableCellNode;
  }, [prevTableCellDOM, tableCellNode]);

  return (
    <div className="table-cell-action-button-container" ref={menuButtonRef}>
      {tableCellNode != null && (
        <>
          <button
            type="button"
            className="table-cell-action-button chevron-down"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            ref={menuRootRef}
          >
            <i className="chevron-down" />
          </button>
          {isMenuOpen && (
            <TableActionMenu
              contextRef={menuRootRef}
              setIsMenuOpen={setIsMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              tableCellNode={tableCellNode}
              cellMerge={cellMerge}
              /* ADD: Custom Components */
              // showColorPickerModal={showColorPickerModal}
              /* END: Custom Components */
            />
          )}
        </>
      )}
    </div>
  );
}
/** ADD: Custom For Table Insert */
export const InsertTableModal = () => {
  const [editor] = useLexicalComposerContext();
  const { setModal } = useModal();
  const columnRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_INSERT_TABLE_MODAL_COMMAND,
        (payload) => {
          setModal(() => (props: ModalProps) => {
            const onSubmit = () => {
              const column = columnRef.current?.value;
              const row = rowRef.current?.value;
              if (!column || !row) {
                return;
              }
              editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                columns: String(column),
                rows: String(row),
              });
              props.close();
            };
            return (
              <div className="form">
                <div className="row">
                  <label className="label" htmlFor="table-column">
                    {t("table:columns")}
                  </label>
                  <input
                    id="table-column"
                    className="input"
                    ref={columnRef}
                    type="number"
                    defaultValue={payload?.defaultColumns ?? 3}
                  />
                </div>
                <div className="row">
                  <label className="label" htmlFor="table-row">
                    {t("table:rows")}
                  </label>
                  <input
                    id="table-row"
                    className="input"
                    ref={rowRef}
                    type="number"
                    defaultValue={payload?.defaultRows ?? 3}
                  />
                </div>
                <button className="button" onClick={onSubmit}>
                  {t("table:submit")}
                </button>
              </div>
            );
          });
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, setModal]);
  return null;
};
/** END: Custom For Table Insert */

export default function TableActionMenuPlugin({
  anchorElem = document.body,
  cellMerge = false,
}: {
  anchorElem?: HTMLElement;
  cellMerge?: boolean;
}): null | JSX.Element {
  const isEditable = useLexicalEditable();
  const [ModalCompoent, setModal] = useState<React.FC<ModalProps>>(undefined);
  return (
    <ModalProvider
      value={{
        ModalChild: ModalCompoent,
        setModal,
      }}
    >
      {createPortal(
        isEditable ? (
          <TableCellActionMenuContainer
            anchorElem={anchorElem}
            cellMerge={cellMerge}
          />
        ) : null,
        anchorElem,
      )}
      <Modal />
      <InsertTableModal />
    </ModalProvider>
  );
}
