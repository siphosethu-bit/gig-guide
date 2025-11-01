import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { err: null }; }
  static getDerivedStateFromError(error){ return { err: error }; }
  componentDidCatch(error, info){ console.error("App error:", error, info); }
  render(){
    if (this.state.err) {
      return (
        <div style={{padding:"2rem", color:"#e5e7eb", background:"#0b0b12"}}>
          <h2 style={{fontWeight:800, marginBottom:8}}>Something broke 💥</h2>
          <p>Open the console for details. Here’s the message:</p>
          <pre style={{whiteSpace:"pre-wrap", marginTop:12, background:"#111", padding:"12px", borderRadius:8}}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
