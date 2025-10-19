export function Login() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('模擬登入成功！')
  }
  return (
    <div className="page auth">
      <h2>登入</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          電子郵件
          <input name="email" type="email" placeholder="you@example.com" required />
        </label>
        <label>
          密碼
          <input name="password" type="password" placeholder="********" required />
        </label>
        <button type="submit" className="primary">登入</button>
      </form>
    </div>
  )
}