import { forwardRef, useEffect, useRef } from "react";

type FormProps = JSX.IntrinsicElements["form"] & {
  onFormdata?(e: FormDataEvent): void;
};
export const Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  const { onFormdata } = props;
  const innerRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const currForm = innerRef.current;

    if (!onFormdata || !currForm) {
      return;
    }

    currForm.addEventListener("formdata", onFormdata);

    return () => {
      currForm.removeEventListener("formdata", onFormdata);
    };
  }, [onFormdata]);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();

        if (!e.currentTarget.checkValidity()) {
          return;
        }

        new FormData(e.currentTarget);
      }}
      {...props}
      ref={(node) => {
        innerRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
    />
  );
});
