export const QUERY_SEARCH_CONSTANTS = {
  PAGE_SIZE: 50000,
  ZERO_OFFSET: 0,
  SHELL_LOADING_WIDTH: 300,
  SHELL_LOADING_HEIGHT: 40,
  SCROLL_THRESHOLD: 50,
  TEXT_TRUNCATE_LENGTH: 30,
  RELEVANT_PARTS_START_INDEX: 2, // Skip first two levels (dream11, table)
  LIST_ITEM_HEIGHT: 40
}

export const DEFAULT_PREFIX = '^dream11:table.*'
export const DEFAULT_NAME = '.'

export enum dataType {
  STRING = 'string',
  INT = 'int',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  TIMESTAMP = 'timestamp',
  BIGINT = 'bigint',
  SMALLINT = 'smallint',
  VARCHAR = 'varchar',
  CHAR = 'char',
  DECIMAL = 'decimal',
  DOUBLE = 'double'
}

export const RAISING_HAND_EMOJI = '\u{1F64B}\u{200D}\u{2640}\u{FE0F}'

export const ICEBERG = 'iceberg'
export const REDSHIFT = 'redshift'
export const TOTAL_ASSET_LENGTH = 35
export const LOADER_NAME = '-1'
