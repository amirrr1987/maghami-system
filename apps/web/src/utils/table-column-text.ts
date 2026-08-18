import type { TableColumnType } from 'ant-design-vue'

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

/** Default cell text from `dataIndex` (for responsive card rows). */
export function getTableColumnText(record: object, column: TableColumnType): string {
  const dataIndex = column.dataIndex
  if (dataIndex === undefined || dataIndex === null) return ''

  const row = record as Record<string, unknown>

  if (Array.isArray(dataIndex)) {
    let value: unknown = row
    for (const key of dataIndex) {
      if (value === null || value === undefined || typeof value !== 'object') return ''
      value = (value as Record<string, unknown>)[String(key)]
    }
    return formatCellValue(value)
  }

  return formatCellValue(row[String(dataIndex)])
}
