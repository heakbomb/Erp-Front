// types/react-to-print.d.ts
declare module "react-to-print" {
  import * as React from "react"

  export interface ReactToPrintProps {
    trigger: () => React.ReactElement
    content: () => React.ReactInstance | null
    documentTitle?: string
    onBeforeGetContent?: () => void | Promise<void>
    onAfterPrint?: () => void
    // 필요하면 나중에 추가
  }

  const ReactToPrint: React.ComponentType<ReactToPrintProps>

  export default ReactToPrint
}
