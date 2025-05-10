import './BtMenu.css';

const BtMenu = ({ text = "botón", icon = "fa-bolt", displayT = true }) => {
  const textLabel = displayT 
    ? <div className='flex-rows-sp cl-text-label'>{text}</div> 
    : null;

    const tooltipvar=!displayT? <div className="tooltip-popup tooltip-right">
    <span className="tooltip-text">{text}</span>
    <div className="tooltip-arrow"></div>
  </div>:null

  return (
    <div className='flex-rows-sp bt-label cl_margin_menu_bt'>
      <i className={`fa-solid ${icon.startsWith('fa-') ? icon : 'fa-' + icon} margin-r pos`}></i>
      {textLabel}

      {tooltipvar}
    </div>
  );
};

export default BtMenu;