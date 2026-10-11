const isRecord=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);

const isSafeManifestAssetUrl=url=>{
 if(typeof url!=='string'||!url.startsWith('/assets/')||url.startsWith('//'))return false;
 if(/[?#\\\\\\x00-\\x1f\\x7f]/.test(url))return false;
 if(/%(?:25)*(?:2e|2f|5c)/i.test(url))return false;
 const segments=url.split('/');
 if(segments.some(segment=>segment==='.'||segment==='..'||segment===''))return false;
 return true;
};

const isEligibleDerivativePath=url=>/^\\/assets\\/(?:hub-photos|hub-photos-extra)\\//.test(url)||/^\\/assets\\/source-archive\\//.test(url);

const isValidImageRecord=(url,record)=>{
 if(!isSafeManifestAssetUrl(url)||!isRecord(record))return false;
 const {width,height,aspectRatio,orientation,derivativesEligible}=record;
 if(!Number.isSafeInteger(width)||width<=0||!Number.isSafeInteger(height)||height<=0)return false;
 if(typeof aspectRatio!=='number'||!Number.isFinite(aspectRatio)||aspectRatio!==Number((width/height).toFixed(5)))return false;
 const expectedOrientation=width===height?'square':width>height?'landscape':'portrait';
 if(orientation!==expectedOrientation||typeof derivativesEligible!=='boolean')return false;
 if(derivativesEligible&&!isEligibleDerivativePath(url))return false;
 return true;
};

/**
 * Validates the generated public image manifest before any derivative URL is
 * advertised. Reject the whole payload on partial/corrupt records so a stale
 * or error document cannot poison the shared responsive-image pipeline.
 */
export const isValidJycImageManifest=payload=>{
 if(!isRecord(payload)||payload.version!==1||!isRecord(payload.images))return false;
 const entries=Object.entries(payload.images);
 if(entries.length===0||entries.length>10000)return false;
 return entries.every(([url,record])=>isValidImageRecord(url,record));
};

export const isSafeJycManifestAssetUrl=isSafeManifestAssetUrl;
