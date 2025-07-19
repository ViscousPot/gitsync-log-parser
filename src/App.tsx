import { useState } from 'react'
import JSZip from 'jszip'
import ColouredLog from './ColouredLog'

type Tab = {
    id: string
    title: string
    content: string
}

function App() {
    const [tabs, setTabs] = useState<Tab[]>([])
    const [activeTabId, setActiveTabId] = useState<string | null>(null)

    const [levelFilter, setLevelFilter] = useState<string>('ALL')
    const [labelFilter, setLabelFilter] = useState<string>('ALL')
    const [reverseOrder, setReverseOrder] = useState(false)

    const labels = [
        'ALL',
        'TEST',
        'Global',
        'AccessibilityService',
        'Sync',
        'Status',
        'AbortMerge',
        'CloneRepo',
        'PullFromRepo',
        'PushToRepo',
        'RecentCommits',
    ]


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const newTabs: Tab[] = []

        if (file.name.endsWith('.log')) {
            const text = await file.text()
            const id = crypto.randomUUID()
            newTabs.push({ id, title: file.name, content: text })
        } else if (file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file)

            for (const filename of Object.keys(zip.files)) {
                const entry = zip.files[filename]
                if (!entry.dir && filename.endsWith('.log')) {
                    const text = await entry.async('string')
                    const id = crypto.randomUUID()
                    newTabs.push({ id, title: filename, content: text })
                }
            }
        }

        if (newTabs.length) {
            setTabs(prev => [...prev, ...newTabs])
            setActiveTabId(newTabs[0].id)
        }
    }

    const handleCloseTab = (id: string) => {
        setTabs(prev => {
            const updated = prev.filter(tab => tab.id !== id)
            if (activeTabId === id) {
                setActiveTabId(updated.length ? updated[0].id : null)
            }
            return updated
        })
    }

    const activeTab = tabs.find(tab => tab.id === activeTabId)

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <div className="w-full max-w-5xl">
                <div className="flex space-x-4 mb-4">
                    <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                        <option value="ALL">All Levels</option>
                        <option value="I">Info</option>
                        <option value="W">Warn</option>
                        <option value="E">Error</option>
                    </select>

                    <select
                        value={labelFilter}
                        onChange={e => setLabelFilter(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                        {labels.map(label => (
                            <option key={label} value={label}>
                                {label === 'ALL' ? 'All Labels' : label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setReverseOrder(prev => !prev)}
                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                        {reverseOrder ? 'Oldest First' : 'Newest First'}
                    </button>
                </div>

                <div className="sticky top-0 bg-gray-100 z-10 border-b border-gray-300 space-y-2 p-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                    <div className="flex space-x-1 border-b border-gray-300 overflow-x-auto">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`flex items-center rounded-t-lg ${tab.id === activeTabId
                                    ? 'bg-white border-t border-l border-r border-gray-300'
                                    : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <button
                                    onClick={() => setActiveTabId(tab.id)}
                                    className="px-4 py-2 text-sm focus:outline-none"
                                >
                                    {tab.title}
                                </button>
                                <button
                                    onClick={() => handleCloseTab(tab.id)}
                                    className="px-2 text-gray-500 hover:text-red-500 text-sm"
                                    title="Close tab"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-gray-300 rounded-b-lg overflow-auto p-4 text-sm text-gray-800 font-mono whitespace-pre-wrap">
                    {activeTab ? <ColouredLog
                        content={activeTab?.content || ''}
                        levelFilter={levelFilter}
                        labelFilter={labelFilter}
                        reverse={reverseOrder}
                    />
                        : 'No file selected.'}
                </div>
            </div>
        </div>
    )
}

export default App
