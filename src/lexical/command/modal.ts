
import type {
  LexicalCommand,
} from "lexical";
import {
  createCommand,
} from "lexical";

interface TableCommandPayload {
  defaultColumns: number;
  defaultRows: number;
}
export const TOGGLE_INSERT_TABLE_MODAL_COMMAND: LexicalCommand<TableCommandPayload | null> =
  createCommand("TOGGLE_INSERT_TABLE_MODAL_COMMAND");