const version = (state = {
  version: '1.6.1',
  date: '01/02/2023',
  version_fw: '-',
  date_fw: '-'
}

, action) => {
  switch (action.type) {
    case 'SET_VERSION':
      return { ...state, version: action.version, date: new Date().toISOString() };
    case 'SET_FW_VERSION':
      return { ...state, version_fw: action.version, date_fw: new Date().toISOString() };
    default:
      return state;
  }
};

export default version;
