import { useState, useCallback } from "react";

/**
 * Custom hook for form management and validation
 * 
 * @param {Object} initialValues 
 * @param {Object} validate 
 * @param {Function} onSubmit
 */
export const useFormValidation = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setValues((prev) => ({ ...prev, [name]: val }));

    // This here clears the error for field when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // This one over here performs field-level validation on blur's
    const validationErrors = validate(values);
    if (validationErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [validate, values]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    const touchedAll = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(touchedAll);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // This helps us to auto-focus the first invalid field!
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setErrors,
    setValues,
    resetForm
  };
};

export default useFormValidation;