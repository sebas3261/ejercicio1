// src/App.js
import React from "react";
import RegisterMember from "./components/RegisterMember";
import MemberList from "./components/MemberList";
import Reports from "./components/Reports";

function App() {
  return (
    <div>
      <h1>Club de Tennis</h1>
      <RegisterMember />
      <MemberList />
      <Reports />
    </div>
  );
}

export default App;
