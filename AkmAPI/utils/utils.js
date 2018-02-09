module.exports = class Utils{
  getName(msg){
      return Object.keys(msg)[0]
  }
  memoize(struct, privateStruct){
      struct ? privateStruct = struct: null;
      privateStruct ? struct = privateStruct: null;
      return { struct, privateStruct }
  }
  checkMsg(msg){
      if(msg[this.getName(msg)].Value && msg[this.getName(msg)].KeyFormat && msg[this.getName(msg)].KeyFormat!=='RSA') return 'Add spaces to Value';
      if(msg[this.getName(msg)].Value && msg[this.getName(msg)].KeyFormat==='RSA') return 'Binary Value';
      if(msg[this.getName(msg)].Value  && msg[this.getName(msg)].ValueLength ) return 'Setting Binary Value and calculate Length';
  }
};