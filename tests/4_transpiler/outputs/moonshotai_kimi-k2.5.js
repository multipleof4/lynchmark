let h,p;

const renderTemplate=async(t,d)=>{
h??=await(p||=import('https://esm.sh/handlebars@4.7.8').then(m=>m.default));
return h.compile(t)(d);
};
export default renderTemplate;
// Generation time: 43.297s
// Result: PASS