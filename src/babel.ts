import type { PluginObj } from '@babel/core'
import * as t from '@babel/types'

function RoutesBabel(): PluginObj {
  return {
    visitor: {
      VariableDeclarator(path) {
        // TODO: routes
        if ((path.node.id as any).name === 'routes') {
          // console.log(path.node.id)
          return null
        }
        return null
      },
      ObjectProperty(path) {
        if ((path.node.key as any).value === 'element') {
          path.node.value = t.callExpression(
            t.memberExpression(t.identifier('React'), t.identifier('createElement')),
            [t.identifier((path.node.value as any).name)],
          )
        }
        return null
      },
    },
  }
}

export default RoutesBabel
