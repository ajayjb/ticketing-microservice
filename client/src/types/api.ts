export enum RequestMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

export type ErrorMessage = {
  field?: string;
  message: string[];
};

export type Response<T> = {
  data: T;
  status: number;
  message: string;
};
