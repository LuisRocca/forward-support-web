const integer = new Intl.NumberFormat('es-ES')
const oneDecimal = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Cifras con el separador de miles y la coma decimal del español. */
export function formatInteger(value: number): string {
  return integer.format(value)
}

export function formatDecimal(value: number): string {
  return oneDecimal.format(value)
}
