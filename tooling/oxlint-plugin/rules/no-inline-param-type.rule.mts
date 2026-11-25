import { defineRule, type ESTree } from '@oxlint/plugins'

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression

function getAnnotation(parameter: ESTree.ParamPattern) {
	if (parameter.type === 'TSParameterProperty')
		return getAnnotation(parameter.parameter)
	if (parameter.type === 'AssignmentPattern')
		return parameter.left.typeAnnotation?.typeAnnotation

	return parameter.typeAnnotation?.typeAnnotation
}

/** The object type literals a parameter is typed with, alone or as a member of a union. */
function findTypeLiterals(type: ESTree.TSType): ESTree.TSTypeLiteral[] {
	if (type.type === 'TSTypeLiteral') return [type]
	if (type.type === 'TSUnionType') return type.types.flatMap(findTypeLiterals)

	return []
}

/** Forbids an object type literal, alone or in a union, as the type of a function parameter. */
export const noInlineParamTypeRule = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Parameter types are named interfaces or aliases, not inline object types.',
		},
		messages: {
			inlineParamType:
				'Name this parameter type: declare an interface or type alias, or derive one with Pick or Omit, instead of an inline object type (AGENTS.md code rules).',
		},
	},
	create(context) {
		function check(node: FunctionNode) {
			for (const parameter of node.params) {
				const type = getAnnotation(parameter)

				if (!type) continue
				for (const literal of findTypeLiterals(type))
					context.report({ node: literal, messageId: 'inlineParamType' })
			}
		}

		return {
			FunctionDeclaration: check,
			FunctionExpression: check,
			ArrowFunctionExpression: check,
			TSDeclareFunction: check,
			TSEmptyBodyFunctionExpression: check,
		}
	},
})
