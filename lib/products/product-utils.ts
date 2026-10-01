/**
 * Product service helper functions.
 */


/**
 * Convert unknown database value into string.
 */
export function toStringValue(
  value: unknown,
  fallback = ""
): string {

  if (typeof value === "string") {

    return value;

  }


  if (
    value === null ||
    value === undefined
  ) {

    return fallback;

  }


  return String(value);

}





/**
 * Convert empty string values into null.
 */
export function toNullableString(
  value: unknown
): string | null {


  const result =
    toStringValue(value).trim();



  return result.length > 0
    ? result
    : null;

}





/**
 * Parse database number safely.
 */
export function parseOptionalNumber(
  value: unknown
): number | null {


  if (
    value === null ||
    value === undefined
  ) {

    return null;

  }



  if (
    typeof value === "number"
  ) {

    return Number.isFinite(value)
      ? value
      : null;

  }




  const normalizedValue =
    String(value)

      .replaceAll(",", "")

      .replaceAll("Rs.", "")

      .replaceAll("Rs", "")

      .replaceAll("LKR", "")

      .replaceAll("MVR", "")

      .replaceAll("USD", "")

      .replaceAll("$", "")

      .trim();




  if (
    normalizedValue.length === 0
  ) {

    return null;

  }



  const parsedValue =
    Number(normalizedValue);



  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;

}





/**
 * Prefer currency specific price.
 */
export function resolvePrice(

  currencySpecificValue: unknown,

  generalValue: unknown,

  finalFallback = 0

): number {



  const currencySpecificNumber =
    parseOptionalNumber(
      currencySpecificValue
    );



  const generalNumber =
    parseOptionalNumber(
      generalValue
    );





  if (

    currencySpecificNumber !== null &&

    currencySpecificNumber > 0

  ) {

    return currencySpecificNumber;

  }





  if (

    generalNumber !== null &&

    generalNumber > 0

  ) {

    return generalNumber;

  }





  if (
    currencySpecificNumber !== null
  ) {

    return currencySpecificNumber;

  }




  if (
    generalNumber !== null
  ) {

    return generalNumber;

  }




  return finalFallback;

}





/**
 * Convert number with fallback.
 */
export function toNumberValue(

  value: unknown,

  fallback = 0

): number {


  return (
    parseOptionalNumber(value)
    ??
    fallback
  );

}





/**
 * Convert database value to boolean.
 */
export function toBooleanValue(

  value: unknown,

  fallback = false

): boolean {



  if (
    typeof value === "boolean"
  ) {

    return value;

  }




  if (

    value === "true" ||

    value === "1" ||

    value === 1

  ) {

    return true;

  }





  if (

    value === "false" ||

    value === "0" ||

    value === 0

  ) {

    return false;

  }




  return fallback;

}





/**
 * Convert unknown value into string array.
 */
export function toStringArray(

  value: unknown

): string[] {


  if (
    !Array.isArray(value)
  ) {

    return [];

  }



  return value

    .map(
      (item)=>
        toStringValue(item).trim()
    )

    .filter(Boolean);

}





/**
 * Convert JSON attributes safely.
 */
export function toAttributes(

  value: unknown

): Record<string, unknown> {


  if (

    typeof value === "object" &&

    value !== null &&

    !Array.isArray(value)

  ) {

    return value as Record<string, unknown>;

  }



  return {};

}





/**
 * Keep database limits safe.
 */
export function getSafeLimit(

  limit:number,

  defaultLimit:number

):number {



  if (
    !Number.isFinite(limit)
  ) {

    return defaultLimit;

  }




  return Math.max(

    1,

    Math.min(

      Math.floor(limit),

      100

    )

  );

}