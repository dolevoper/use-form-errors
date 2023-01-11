import { FormEvent, useState } from "react";

type ValidationConfig = Partial<
	Record<keyof ValidityState, string> &
	Record<
		"validate",
		(el: HTMLInputElement | HTMLTextAreaElement, formData: FormData) => string
	>
>;

export function useFormErrors(errors?: Record<string, string>) {
	const [formErrors, setFormErrors] = useState<
		Record<string, string> | undefined
	>(errors);

	return {
		formErrors,
		errorsFromForm(el: HTMLFormElement) {
			setFormErrors(
				Object.fromEntries(
					Object.entries(el.elements).map(([key, element]) => [
						key,
						(element as HTMLInputElement).validationMessage
					])
				)
			);
		},
		fieldValidation(
			{ validate = () => "", ...config }: ValidationConfig = {
				validate: () => ""
			}
		) {
			function applyCustomValidity(el: HTMLInputElement | HTMLTextAreaElement) {
				el.setCustomValidity(validate(el, new FormData(el.form ?? undefined)));

				if (el.validity.customError) {
					return;
				}

				for (const key in el.validity) {
					if (el.validity[key as keyof ValidityState]) {
						el.setCustomValidity(config[key as keyof ValidityState] ?? "");
						return;
					}
				}
			}

			function _validate(el: HTMLInputElement | HTMLTextAreaElement) {
				applyCustomValidity(el);

				if (!formErrors || formErrors[el.name] === el.validationMessage) {
					return;
				}

				setFormErrors({
					...formErrors,
					[el.name]: el.validationMessage
				});
			}

			return {
				validate: _validate,
				onInvalid(e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
					applyCustomValidity(e.currentTarget);
				},
				onInput(e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
					_validate(e.currentTarget);
				}
			};
		}
	};
}
