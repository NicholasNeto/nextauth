import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next Auth</title>
      </Head>

      <main className={styles.main}>
       Hello World!
      </main>

    </div>
  )
}

export default Home
