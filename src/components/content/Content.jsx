import './Content.css'

function Content({ children }) {
  return (
    <div className='cl-main cl-flex-center'>
      {children}
    </div>
  )
}

export default Content