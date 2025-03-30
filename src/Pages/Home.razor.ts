import "jquery-ui-pack/jquery-ui.js";
import pq from "pqgrid";
export function initializePQGrid(
  element: HTMLElement,
  data: Record<string, any>[],
  options: pq.gridT.options
) {
  console.log(element,data,options);
  pq.grid(element as unknown as JQuery<HTMLElement>, {
    ...options,
    dataModel: {
      ...options.dataModel,
      data,
    }
  });
}