import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script>0</script> {/* next-themes script to prevent hydration mismatch */}
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
