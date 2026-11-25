import { defineRule, type ESTree, type Fixer } from '@oxlint/plugins'

type ProgramStatement = ESTree.Program['body'][number]

function isSingleLineConst(statement: ProgramStatement) {
	const declaration =
		statement.type === 'ExportNamedDeclaration'
			? statement.declaration
			: statement

	return (
		declaration?.type === 'VariableDeclaration' &&
		declaration.kind === 'const' &&
		statement.loc.start.line === statement.loc.end.line &&
		declaration.declarations.every(({ id }) => id.type === 'Identifier')
	)
}

function getBlankRuns(gap: ESTree.Span[]) {
	return gap.flatMap((item, index) => {
		const previous = gap[index - 1]

		return previous && item.loc.start.line - previous.loc.end.line > 1
			? [{ previous, item }]
			: []
	})
}

function hasOwnLineComment(previous: ProgramStatement, gap: ESTree.Span[]) {
	return gap.some(
		item =>
			'type' in item &&
			(item.type === 'Line' || item.type === 'Block') &&
			item.loc.start.line > previous.loc.end.line
	)
}

/** Removes blank lines between consecutive single-line module-level `const` declarations; an own-line comment in the gap keeps the separation. */
export const declarationGroupSpacingRule = defineRule({
	meta: {
		type: 'layout',
		docs: {
			description:
				'Consecutive single-line module-level const declarations stay together without blank lines.',
		},
		fixable: 'whitespace',
		messages: {
			blankLineInDeclarationGroup:
				'Consecutive single-line module-level const declarations stay together; remove the blank line (AGENTS.md code rules).',
		},
	},
	create(context) {
		const { sourceCode } = context

		function getGap(
			previous: ProgramStatement,
			next: ProgramStatement
		): ESTree.Span[] {
			return [
				previous,
				...sourceCode.getTokensBetween(previous, next, {
					includeComments: true,
				}),
				next,
			]
		}

		function checkPair(previous: ProgramStatement, next: ProgramStatement) {
			if (!(isSingleLineConst(previous) && isSingleLineConst(next))) return

			const gap = getGap(previous, next)
			const blankRuns = getBlankRuns(gap)

			if (blankRuns.length === 0 || hasOwnLineComment(previous, gap)) return

			context.report({
				node: next,
				messageId: 'blankLineInDeclarationGroup',
				fix: (fixer: Fixer) =>
					blankRuns.map(({ previous: { end }, item }) => {
						const whitespace = sourceCode.text.slice(end, item.start)
						const newline = /\r\n?|\n/u.exec(whitespace)?.[0] ?? '\n'
						const indentation = whitespace.slice(
							whitespace.lastIndexOf('\n') + 1
						)

						return fixer.replaceTextRange(
							[end, item.start],
							`${newline}${indentation}`
						)
					}),
			})
		}

		return {
			Program(node) {
				for (const [index, statement] of node.body.entries()) {
					const previous = node.body[index - 1]

					if (previous) checkPair(previous, statement)
				}
			},
		}
	},
})
