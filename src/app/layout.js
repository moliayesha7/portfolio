import './globals.css'

export const metadata = {
  title: 'Ayesha Khatun',
  description: 'Created by Ayesha Khatun',
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
        <body>
                {children}
        </body>
    </html>
  )
}
