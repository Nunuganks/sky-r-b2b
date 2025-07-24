import '@payloadcms/next/css'
import '../custom.scss'
import './styles.css'

export default function CompactProductEditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="payload-admin">
      {children}
    </div>
  )
} 