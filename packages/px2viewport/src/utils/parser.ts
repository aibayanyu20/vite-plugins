import _parser from '@babel/parser'

export default typeof (_parser as any).parse === 'undefined' ? _parser : (_parser as any).parse as typeof _parser
