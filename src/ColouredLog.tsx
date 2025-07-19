function ColouredLog({
    content,
    levelFilter = 'ALL',
    labelFilter = 'ALL',
    reverse = false,
}: {
    content: string
    levelFilter?: string
    labelFilter?: string
    reverse?: boolean
}) {
    const lines = content.split('\n')
    const levelColors: Record<string, string> = {
        W: 'text-yellow-600',
        I: 'text-green-600',
        E: 'text-red-700',
    }

    const blocks: string[][] = []
    let currentBlock: string[] = []

    lines.forEach(line => {
        const isNewBlock = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} \[.\] \w+: /.test(line)
        if (isNewBlock) {
            if (currentBlock.length) blocks.push(currentBlock)
            currentBlock = [line]
        } else {
            currentBlock.push(line)
        }
    })
    if (currentBlock.length) blocks.push(currentBlock)

    const filteredBlocks = blocks.filter(block => {
        const header = block[0]
        const match = header.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) \[(.)\] (\w+): (.*)$/)
        if (!match) return false
        const [, , level, label] = match

        if (levelFilter !== 'ALL' && level !== levelFilter) return false
        if (labelFilter !== 'ALL' && !label.toLowerCase().includes(labelFilter.toLowerCase()))
            return false
        return true
    })

    if (reverse) filteredBlocks.reverse()

    let currentColor = 'text-gray-800'

    return (
        <pre className="whitespace-pre-wrap font-mono text-sm max-h-[60vh] overflow-auto">
            {filteredBlocks.flatMap((block, i) => {
                return block.map((line, j) => {
                    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) \[(.)\] (\w+): (.*)$/)

                    if (match) {
                        const [, timestamp, level, module, message] = match
                        currentColor = levelColors[level] || 'text-gray-800'

                        return (
                            <div key={`${i}-${j}`}>
                                <span className="text-gray-500">{timestamp} </span>
                                {level === 'E' ? (
                                    <span className={currentColor}>
                                        [{level}] {module}: {message}
                                    </span>
                                ) : (
                                    <>
                                        <span className={currentColor}>[{level}] </span>
                                        <span className="text-blue-600">{module}: </span>
                                        <span>{message}</span>
                                    </>
                                )}
                            </div>
                        )
                    }

                    return (
                        <div key={`${i}-${j}`} className={currentColor}>
                            {line}
                        </div>
                    )
                })
            })}
        </pre>
    )
}

export default ColouredLog