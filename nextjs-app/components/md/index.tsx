import React, { useState, memo } from 'react'
import Markdown from "markdown-to-jsx"
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Copy, Check, Code2, FileCode2, Terminal, BookOpen, GraduationCap, ExternalLink as ExternalLinkIcon, ChevronRight, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Language mapping for syntax highlighting
const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'jsx',
    tsx: 'tsx',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
}

// Component for inline code blocks
const InlineCode = memo(({ children }: { children: React.ReactNode }) => (
    <code className={cn(
        "relative rounded px-[0.3rem] py-[0.2rem]",
        "font-mono text-sm font-semibold",
        "bg-gradient-to-r from-[hsl(var(--primary)_/_0.1)] to-[hsl(var(--info)_/_0.1)]",
        "text-[hsl(var(--primary))] hover:text-[hsl(var(--info))]",
        "transition-colors duration-200"
    )}>
        <Code2 className="w-4 h-4 inline-block mr-1" />
        {children}
    </code>
))

// Component for code block header
const CodeBlockHeader = memo(({ displayLang, copied, onCopy, showLanguageHint, showCopyButton }: {
    displayLang: string
    copied: boolean
    onCopy: () => void
    showLanguageHint: boolean
    showCopyButton: boolean
}) => (
    <div className="flex justify-between items-center px-4 py-2 bg-[hsl(var(--secondary)_/_0.5)]">
        {showLanguageHint && (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--danger))]"></div>
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--warning))]"></div>
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]"></div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gradient">
                    <Terminal className="w-4 h-4 text-[hsl(var(--primary))]" />
                    {displayLang.replace("lang-", "")}
                </div>
            </div>
        )}

        {showCopyButton && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onCopy}
                            className={cn(
                                "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
                                "h-7 w-7"
                            )}
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-[hsl(var(--success))]" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{copied ? 'Copied!' : 'Copy code'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
    </div>
))

// Component for code blocks
const CodeBlock = ({
    children,
    className,
    language = '',
    showLineNumbers = true,
    showCopyButton = true,
    showLanguageHint = true
}: CodeBlockProps) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(children)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!className) {
        return <InlineCode>{children}</InlineCode>
    }

    const detectedLang = className?.replace('language-', '') || language
    const displayLang = languageMap[detectedLang] || detectedLang

    return (
        <div className={cn(
            "relative my-6 rounded-lg overflow-hidden",
            "border border-[hsl(var(--border))]",
            "shadow-custom backdrop-blur"
        )}>
            <CodeBlockHeader 
                displayLang={displayLang}
                copied={copied}
                onCopy={copyToClipboard}
                showLanguageHint={showLanguageHint}
                showCopyButton={showCopyButton}
            />

            <div className="relative">
                <SyntaxHighlighter
                    language={displayLang.replace("lang-","")}
                    style={dracula}
                    showLineNumbers={showLineNumbers}
                    customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        padding: '1.5rem 1rem',
                    }}
                >
                    {children}
                </SyntaxHighlighter>
            </div>
        </div>
    )
}

// Heading components
const H1 = memo(({ children }: { children: React.ReactNode }) => (
    <h1 className={cn(
        'text-3xl font-extrabold mb-8',
        'text-gradient-purple-blue',
        'border-b-2 border-[hsl(var(--border))] pb-4',
        'animate-fade flex items-center gap-2'
    )}>
        <GraduationCap className="w-8 h-8" />
        {children}
    </h1>
))

const H2 = memo(({ children }: { children: React.ReactNode }) => (
    <h2 className={cn(
        'text-2xl font-bold mt-12 mb-6',
        'text-gradient-pink-purple',
        'border-b border-[hsl(var(--border))] pb-2',
        'animate-fade flex items-center gap-2'
    )}>
        <BookOpen className="w-6 h-6" />
        {children}
    </h2>
))

const H3 = memo(({ children }: { children: React.ReactNode }) => (
    <h3 className={cn(
        'text-xl font-semibold mt-8 mb-4',
        'text-gradient-green-teal',
        'animate-fade flex items-center gap-2'
    )}>
        <Hash className="w-5 h-5" />
        {children}
    </h3>
))

// Paragraph component
const Paragraph = memo(({ children }: { children: React.ReactNode }) => (
    <p className={cn(
        "leading-7 mb-6",
        "animate-fade"
    )}>
        {children}
    </p>
))

// List components
const UnorderedList = memo(({ children }: { children: React.ReactNode }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        {children}
    </ul>
))

const OrderedList = memo(({ children }: { children: React.ReactNode }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
        {children}
    </ol>
))

const ListItem = memo(({ children }: { children: React.ReactNode }) => (
    <li className={cn(
        'pl-2',
        'border-l-2 border-[hsl(var(--border))]',
        'hover:border-[hsl(var(--primary))] transition-colors'
    )}>
        <ChevronRight className="w-4 h-4 inline-block mr-2" />
        {children}
    </li>
))

// Link components
const InternalLink = memo(({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
    <Link
        href={href}
        className={cn(
            "font-medium inline-flex items-center gap-1",
            "text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)_/_0.8)]",
            "underline-offset-4 hover:underline",
            "transition-colors animate-fade"
        )}
        {...props}
    >
        {children}
    </Link>
))

const ExternalLinkComponent = memo(({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
    <a
        href={href}
        className={cn(
            "font-medium inline-flex items-center gap-1",
            "text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)_/_0.8)]",
            "underline-offset-4 hover:underline",
            "transition-colors animate-fade"
        )}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
    >
        {children}
        <ExternalLinkIcon className="w-4 h-4" />
    </a>
))

const LinkComponent = memo(({ children, href, ...props }: { children: React.ReactNode, href?: string }) => {
    if (href?.startsWith('/')) {
        return <InternalLink href={href} {...props}>{children}</InternalLink>
    }
    return <ExternalLinkComponent href={href || '#'} {...props}>{children}</ExternalLinkComponent>
})

// Blockquote component
const BlockQuote = memo(({ children }: { children: React.ReactNode }) => (
    <blockquote className={cn(
        "mt-6 border-l-2 pl-6 italic",
        "border-[hsl(var(--primary))]",
        "glass-effect",
        "p-4 rounded-r-lg",
        "shadow-custom"
    )}>
        {children}
    </blockquote>
))

interface CodeBlockProps {
    children: string
    className?: string
    language?: string
    showLineNumbers?: boolean
    showCopyButton?: boolean
    showLanguageHint?: boolean
}

interface MarkdownRendererProps {
    content: string
    className?: string
}

const MarkdownRenderer = memo(({ content, className }: MarkdownRendererProps) => {
    return (
        <div className={cn(
            "prose dark:prose-invert max-w-none",
            "prose-headings:font-bold prose-headings:tracking-tight",
            "prose-a:text-[hsl(var(--primary))] prose-a:no-underline hover:prose-a:underline",
            "prose-code:text-[hsl(var(--primary))]",
            "prose-pre:bg-transparent prose-pre:p-0",
            "bg-[hsl(var(--background))] rounded-lg p-6",
            "border border-[hsl(var(--border))]",
            "shadow-custom",
            className
        )}>
            <Markdown
                options={{
                    overrides: {
                        h1: { component: H1 },
                        h2: { component: H2 },
                        h3: { component: H3 },
                        p: { component: Paragraph },
                        ul: { component: UnorderedList },
                        ol: { component: OrderedList },
                        li: { component: ListItem },
                        code: CodeBlock,
                        a: { component: LinkComponent },
                        blockquote: { component: BlockQuote }
                    }
                }}
            >
                {content}
            </Markdown>
        </div>
    )
})

// Add display names for memo components
InlineCode.displayName = 'InlineCode'
CodeBlockHeader.displayName = 'CodeBlockHeader'
CodeBlock.displayName = 'CodeBlock'
H1.displayName = 'H1'
H2.displayName = 'H2'
H3.displayName = 'H3'
Paragraph.displayName = 'Paragraph'
UnorderedList.displayName = 'UnorderedList'
OrderedList.displayName = 'OrderedList'
ListItem.displayName = 'ListItem'
InternalLink.displayName = 'InternalLink'
ExternalLinkComponent.displayName = 'ExternalLinkComponent'
LinkComponent.displayName = 'LinkComponent'
BlockQuote.displayName = 'BlockQuote'
MarkdownRenderer.displayName = 'MarkdownRenderer'

export default MarkdownRenderer