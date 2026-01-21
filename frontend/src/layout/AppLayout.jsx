export default function AppLayout({ children }) {
  return (
    <div>
      <nav>Navbar</nav>
      <main>{children}</main>
    </div>
  );
}
