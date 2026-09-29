export function fail(message,status=400){const error=new Error(message);error.status=status;throw error;}
export function fixed(value,scale=100,label='Amount') {
  if(value===''||value==null)return 0;
  const text=String(value).trim();
  if(!/^\d+(\.\d+)?$/.test(text))fail(`${label} must be a non-negative number`);
  const [whole,fraction='']=text.split('.');
  const precision=String(scale).length-1;
  const units=BigInt(whole)*BigInt(scale)+BigInt(fraction.padEnd(precision,'0').slice(0,precision)||'0')+(Number(fraction[precision]||0)>=5?1n:0n);
  if(units>1000000000000n)fail(`${label} exceeds the supported limit`);
  const scaled=Number(units);
  return scaled;
}
export function validDate(value,label='Date') {if(!/^\d{4}-\d{2}-\d{2}$/.test(value||'')||Number.isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail(`${label} must be a valid calendar date`);return value;}
export function roundedProduct(a,b,divisor){return Number((BigInt(a)*BigInt(b)+BigInt(divisor)/2n)/BigInt(divisor));}
export function documentTotals(lines) {
  if(!Array.isArray(lines)||!lines.length||lines.length>200)fail('Add between 1 and 200 line items');
  let subtotalMinor=0,taxMinor=0;
  const normalized=lines.map(line=>{
    const description=String(line.description||'').trim();if(!description)fail('Every line needs a description');
    const quantityMilli=fixed(line.quantity,1000,'Quantity');if(!quantityMilli)fail('Quantity must be greater than zero');
    const unitPriceMinor=fixed(line.unitPrice);const taxBasisPoints=fixed(line.taxRate,100,'Tax rate');if(taxBasisPoints>10000)fail('Tax rate cannot exceed 100%');
    const netMinor=roundedProduct(quantityMilli,unitPriceMinor,1000);const lineTaxMinor=roundedProduct(netMinor,taxBasisPoints,10000);
    if(!Number.isSafeInteger(netMinor)||netMinor>1e12)fail('Line total exceeds supported limit');
    subtotalMinor+=netMinor;taxMinor+=lineTaxMinor;
    return {description,quantity:quantityMilli/1000,unitPrice:unitPriceMinor/100,taxRate:taxBasisPoints/100,netMinor,taxMinor:lineTaxMinor,totalMinor:netMinor+lineTaxMinor};
  });
  if(!Number.isSafeInteger(subtotalMinor+taxMinor)||subtotalMinor+taxMinor>1e12)fail('Document total exceeds supported limit');
  if(subtotalMinor<=0)fail('Document total must be greater than zero');
  return {lines:normalized,subtotalMinor,taxMinor,totalMinor:subtotalMinor+taxMinor};
}
export function money(value,currency='AED'){return new Intl.NumberFormat('en-AE',{style:'currency',currency}).format((value||0)/100);}
