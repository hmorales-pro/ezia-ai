/**
 * JSON Schema validation utilities for site generation
 * Minimal implementation without external dependencies
 */

export interface ValidationError {
  keyword: string;
  dataPath: string;
  schemaPath: string;
  params: Record<string, any>;
  message: string;
}

export interface ValidateFunction {
  (data: any): boolean;
  errors?: ValidationError[] | null;
}

// Type guard helpers
export const isString = (value: any): value is string => typeof value === "string";
export const isNumber = (value: any): value is number => typeof value === "number";
export const isBoolean = (value: any): value is boolean => typeof value === "boolean";
export const isObject = (value: any): value is object => value !== null && typeof value === "object";
export const isArray = (value: any): value is any[] => Array.isArray(value);

// Basic validators
export const validateString = (minLength?: number, maxLength?: number): ValidateFunction => {
  const fn: ValidateFunction = (data: any) => {
    if (!isString(data)) {
      fn.errors = [{ keyword: "type", dataPath: "", schemaPath: "", params: { type: "string" }, message: "should be string" }];
      return false;
    }
    
    if (minLength !== undefined && data.length < minLength) {
      fn.errors = [{ keyword: "minLength", dataPath: "", schemaPath: "", params: { minLength }, message: `should be at least ${minLength} characters` }];
      return false;
    }
    
    if (maxLength !== undefined && data.length > maxLength) {
      fn.errors = [{ keyword: "maxLength", dataPath: "", schemaPath: "", params: { maxLength }, message: `should be at most ${maxLength} characters` }];
      return false;
    }
    
    return true;
  };
  return fn;
};

export const validateObject = (properties: Record<string, ValidateFunction>, required?: string[]): ValidateFunction => {
  const fn: ValidateFunction = (data: any) => {
    if (!isObject(data)) {
      fn.errors = [{ keyword: "type", dataPath: "", schemaPath: "", params: { type: "object" }, message: "should be object" }];
      return false;
    }
    
    const errors: ValidationError[] = [];
    
    // Check required properties
    if (required) {
      for (const prop of required) {
        if (!(prop in data)) {
          errors.push({ keyword: "required", dataPath: "", schemaPath: "", params: { missingProperty: prop }, message: `should have required property '${prop}' });
        }
      }
    }
    
    // Validate properties
    for (const [key, validator] of Object.entries(properties)) {
      if (key in data) {
        const isValid = validator(data[key]);
        if (!isValid && validator.errors) {
          errors.push(...validator.errors.map(err => ({
            ...err,
            dataPath: `${dataPath}.${key}`,
            schemaPath: `${schemaPath}/${key}`
          })));
        }
      }
    }
    
    if (errors.length > 0) {
      fn.errors = errors;
      return false;
    }
    
    return true;
  };
  return fn;
};

export const validateArray = (itemsValidator?: ValidateFunction): ValidateFunction => {
  const fn: ValidateFunction = (data: any) => {
    if (!isArray(data)) {
      fn.errors = [{ keyword: "type", dataPath: "", schemaPath: "", params: { type: "array" }, message: "should be array" }];
      return false;
    }
    
    if (itemsValidator) {
      const errors: ValidationError[] = [];
      data.forEach((item, index) => {
        const isValid = itemsValidator(item);
        if (!isValid && itemsValidator.errors) {
          errors.push(...itemsValidator.errors.map(err => ({
            ...err,
            dataPath: `${dataPath}[${index}]`
          })));
        }
      });
      
      if (errors.length > 0) {
        fn.errors = errors;
        return false;
      }
    }
    
    return true;
  };
  return fn;
};

export const validateEnum = (values: any[]): ValidateFunction => {
  const fn: ValidateFunction = (data: any) => {
    if (!values.includes(data)) {
      fn.errors = [{ keyword: "enum", dataPath: "", schemaPath: "", params: { allowedValues: values }, message: `should be equal to one of the allowed values: ${values.join(", ")}` }];
      return false;
    }
    return true;
  };
  return fn;
};

// Site schema validators
export const validateTheme: ValidateFunction = validateObject({
  name: validateString(1, 100),
  tokens: validateObject({
    colors: validateObject({
      primary: validateString(),
      secondary: validateString(),
      accent: validateString(),
      background: validateString(),
      surface: validateString(),
      text: validateString(),
      textSecondary: validateString(),
      border: validateString(),
      error: validateString(),
      success: validateString(),
      warning: validateString(),
      info: validateString(),
    }, ["primary", "secondary", "background", "text"]),
    typography: validateObject({
      fontFamily: validateObject({
        heading: validateString(),
        body: validateString(),
        mono: validateString(),
      }, ["heading", "body"]),
      fontSize: validateObject({
        xs: validateString(),
        sm: validateString(),
        base: validateString(),
        lg: validateString(),
        xl: validateString(),
        "2xl": validateString(),
        "3xl": validateString(),
        "4xl": validateString(),
      }, ["base"]),
      fontWeight: validateObject({
        light: (data: any) => isNumber(data) && data >= 100 && data <= 900,
        normal: (data: any) => isNumber(data) && data >= 100 && data <= 900,
        medium: (data: any) => isNumber(data) && data >= 100 && data <= 900,
        semibold: (data: any) => isNumber(data) && data >= 100 && data <= 900,
        bold: (data: any) => isNumber(data) && data >= 100 && data <= 900,
      }, ["normal", "bold"]),
      lineHeight: validateObject({
        tight: (data: any) => isNumber(data) && data > 0,
        normal: (data: any) => isNumber(data) && data > 0,
        relaxed: (data: any) => isNumber(data) && data > 0,
      }, ["normal"]),
    }, ["fontFamily"]),
    spacing: validateObject({
      px: validateString(),
      xs: validateString(),
      sm: validateString(),
      md: validateString(),
      lg: validateString(),
      xl: validateString(),
      "2xl": validateString(),
      "3xl": validateString(),
      "4xl": validateString(),
    }, ["md", "lg"]),
    borderRadius: validateObject({
      none: validateString(),
      sm: validateString(),
      md: validateString(),
      lg: validateString(),
      full: validateString(),
    }, ["md", "full"]),
    shadows: validateObject({
      sm: validateString(),
      md: validateString(),
      lg: validateString(),
      xl: validateString(),
    }, ["md"]),
  }, ["colors"]),
}, ["name", "tokens"]);

export const validateBlock: ValidateFunction = validateObject({
  id: validateString(1),
  type: validateString(1),
  component: validateString(1),
  props: validateObject({}),
  spec: validateObject({
    inputs: validateObject({}),
    css: validateString(),
    template: validateString(),
    category: validateString(),
    description: validateString(),
  }),
  styles: validateObject({}),
}, ["id", "type", "component", "props"]);

export const validatePage: ValidateFunction = validateObject({
  id: validateString(1),
  title: validateString(1),
  slug: validateString(1),
  meta: validateObject({
    description: validateString(),
    keywords: validateArray(validateString(1)),
    ogImage: validateString(),
  }),
  blocks: validateArray(validateBlock),
}, ["id", "title", "slug", "blocks"]);

export const validateAsset: ValidateFunction = validateObject({
  id: validateString(1),
  type: validateEnum(["image", "icon", "video"]),
  url: validateString(1),
  alt: validateString(),
  metadata: validateObject({}),
}, ["id", "type", "url"]);

export const validateNavigation: ValidateFunction = validateObject({
  header: validateObject({
    logo: validateString(),
    links: validateArray(validateObject({
      label: validateString(1),
      href: validateString(1),
    }, ["label", "href"])),
  }),
  footer: validateObject({
    logo: validateString(),
    links: validateArray(validateObject({
      label: validateString(1),
      href: validateString(1),
    }, ["label", "href"])),
    social: validateArray(validateObject({
      platform: validateString(1),
      url: validateString(1),
    }, ["platform", "url"])),
    copyright: validateString(),
  }),
});

export const validateSiteStructure: ValidateFunction = validateObject({
  id: validateString(1),
  title: validateString(1),
  description: validateString(),
  domain: validateString(),
  locale: validateString(),
  pages: validateArray(validatePage),
  assets: validateArray(validateAsset),
  theme: validateTheme,
  navigation: validateNavigation,
  customBlocks: validateObject({}, undefined), // Any object is valid
}, ["id", "title", "pages", "theme", "navigation"]);

// Event validation
export const validateStreamingEvent = (event: any): event is StreamingEvent => {
  return (
    isObject(event) &&
    isString(event.type) &&
    [
      "theme",
      "page",
      "block",
      "asset",
      "navigation",
      "complete",
      "error",
      "phase_start",
      "phase_complete",
    ].includes(event.type) &&
    isObject(event.payload)
  );
};

// Utility functions
export const getValidationErrors = (validator: ValidateFunction, data: any): string[] => {
  const isValid = validator(data);
  if (isValid || !validator.errors) return [];
  
  return validator.errors.map(error => {
    const path = error.dataPath ? `${error.dataPath}: ` : "";
    return `${path}${error.message}`;
  });
};