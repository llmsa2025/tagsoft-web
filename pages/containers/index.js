// pages/containers/index.js
export async function getServerSideProps() {
  return {
    redirect: { destination: '/accounts', permanent: false },
  };
}
export default function ContainersIndexRedirect() {
  return null; // Nunca renderiza; apenas redireciona no SSR
}
