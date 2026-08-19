const Header = () => {
  return (
    <header className="header">
      <div className="header-spacer"></div>
      
      <h1 className="header-title">
        <span className="fire-icon">🔥</span> Wildfire Tracker
      </h1>
      
      <div className="header-badge">
        <span className="pulse-dot"></span>
        <span>NASA EONET</span>
      </div>
    </header>
  )
}

export default Header