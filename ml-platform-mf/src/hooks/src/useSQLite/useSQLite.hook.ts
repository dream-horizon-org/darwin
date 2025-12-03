// @ts-ignore
import sqlWasm from '!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm'
import {useEffect, useState} from 'react'
import initSqlJs, {Database, QueryExecResult} from 'sql.js'

export const useSQLite = () => {
  const [db, setDb] = useState<Database>(null)
  const [dbInitErrorMessage, setDBInitErrorMessage] = useState<string>('')

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const SQL = await initSqlJs({locateFile: () => sqlWasm})
        setDb(new SQL.Database())
        setDBInitErrorMessage('')
      } catch (err) {
        setDBInitErrorMessage(err instanceof Error ? err.message : String(err))
      }
    }
    loadDatabase()
    return () => {
      if (db) db.close()
    }
  }, [])

  const executeQuery = (query: string): QueryExecResult[] => db.exec(query)

  const runQuery = (query: string) => db.run(query)

  const clearDB = () => {
    const permanentTables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table';"
    )
    if (permanentTables[0]?.values) {
      for (const [tableName] of permanentTables[0].values) {
        db.exec(`DROP TABLE IF EXISTS ${tableName};`)
      }
    }
    const tempTables = db.exec(
      "SELECT name FROM sqlite_temp_master WHERE type='table';"
    )
    if (tempTables[0]?.values) {
      for (const [tableName] of tempTables[0].values) {
        db.exec(`DROP TABLE IF EXISTS ${tableName};`)
      }
    }
  }

  return {runQuery, executeQuery, clearDB, dbInitErrorMessage}
}
