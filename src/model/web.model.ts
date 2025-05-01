class Paging {
  current_page: number;
  total_page: number;
  size: number;
}

export class WebResponse<T> {
  code: number;
  status: string;
  data?: T;
  paging?: Paging;
}
