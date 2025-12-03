import 'codemirror/keymap/sublime'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql'
import 'codemirror/theme/monokai.css'
import React from 'react'
import {Controlled as CodeMirror} from 'react-codemirror2'

export type SqlEditorProps = {
  /**
   * Function to execute before value changes inside sqlEditor.
   */
  onBeforeChange: (editor, data, value) => void
  /**
   * Function to execute on value changes inside sqlEditor.
   */
  onChange?: (editor, data, value) => void
  /**
   * Do not allow editing the content inside editor
   */
  readOnly?: Boolean
  /**
   * Whether CodeMirror should scroll or wrap for long lines. Defaults to false (scroll).
   */
  lineWrapping?: Boolean
  /**
   * Text that needs to be displayed inside sqlEditor.
   */
  text: string
  /**
   * Mode of the text editor
   */
  mode: string
}

export function SqlEditor(props: SqlEditorProps) {
  const {onBeforeChange, onChange, text, lineWrapping, readOnly, mode} = props

  return (
    <CodeMirror
      onBeforeChange={onBeforeChange}
      onChange={onChange}
      options={{
        theme: 'monokai',
        keyMap: 'sublime',
        mode: mode,
        lineWrapping: lineWrapping,
        lineNumbers: true,
        readOnly: readOnly
      }}
      value={text}
      {...props}
    />
  )
}

SqlEditor.defaultProps = {
  lineWrapping: false,
  readOnly: false
}
