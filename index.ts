import { FormEvent, useState } from "react";

type ValidationConfig = Partial<
	Record<keyof ValidityState, string> &
	{
		validate(el: HTMLInputElement | HTMLTextAreaElement, formData: FormData): string,
		effects: [string, (el: HTMLInputElement | HTMLTextAreaElement) => void][]
	}
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
			{ validate = () => "", effects = [], ...config }: ValidationConfig = {
				validate: () => "", effects: []
			}
		) {
			function applyCustomValidity(el: HTMLInputElement | HTMLTextAreaElement) {
				el.setCustomValidity(validate(el, new FormData(el.form?.cloneNode() ?? undefined)));

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

					effects.forEach(([dependant, validation]) => {
						validation(e.currentTarget.form?.elements.namedItem(dependant) as HTMLInputElement);
					});
				}
			};
		}
	};
}
