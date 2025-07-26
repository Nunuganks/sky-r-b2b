import '@payloadcms/next/css'
import '../custom.scss'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="payload-admin">
          {children}
        </div>
      </body>
    </html>
  )
}
