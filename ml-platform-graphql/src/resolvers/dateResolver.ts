import {StringValueNode} from 'graphql'
import {GraphQLScalarType} from 'graphql/type'

/**
 * Custom Date resolvers
 */
export const DateResolver = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: Date) {
    return new Date(value).toISOString()
  },
  parseValue(value: string) {
    return new Date(Date.parse(value)).toISOString()
  },
  parseLiteral(node: StringValueNode) {
    return new Date(Date.parse(node.value)).toISOString()
  },
})
