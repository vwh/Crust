// stdlib/errors.ts | Standard library errors

import {
  makeNativeFunctionValue,
  makeStringValue,
  type ErrorType,
  type StringValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

const throwError = makeNativeFunctionValue((args) => {
  const message = (args[0] ?? makeStringValue("")) as StringValue;
  if (message.type !== "string") {
    throwAnError(
      "RuntimeError",
      `Expected a string but got [ ${message.type} ]`
    );
  }

  const type = (args[1] ?? makeStringValue("")) as StringValue;
  if (type.type !== "string") {
    throwAnError("RuntimeError", `Expected a string but got [ ${type.type} ]`);
  }

  throwAnError(type.value as ErrorType, message.value);
});

export default {
  throw: throwError,
};
