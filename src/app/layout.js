export const metadata = {
  title: 'AI Voice Changer',
  description: 'Change your voice using AI-generated speech.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
