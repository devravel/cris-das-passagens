export type ActionFailure = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ActionSuccess<T = undefined> = {
  ok: true;
  message: string;
  data?: T;
};

export type ActionResult<T = undefined> = ActionSuccess<T> | ActionFailure;
