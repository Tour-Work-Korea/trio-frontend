import {readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export const tripsOriginId = 'nangman-trips-isolated';
export const tripsPatterns = ['/trips', '/trips/*', '/trips-assets/*'];
export const functionArn = 'arn:aws:cloudfront::590052531747:function/nangman-trips-router';

// Add new travel routes without changing any existing setting.
export function planCloudFront(config) {
  const next = structuredClone(config);
  const app = config.Origins.Items.find(origin => origin.OriginPath === '/app' && origin.DomainName === 'ddakji-react-apps.s3.ap-northeast-2.amazonaws.com');
  if (!app || config.DefaultCacheBehavior.TargetOriginId !== app.Id) throw new Error('Unexpected app origin; stop for review.');
  if (config.Origins.Items.some(origin => origin.Id === tripsOriginId) ||
      (config.CacheBehaviors.Items || []).some(behavior => tripsPatterns.includes(behavior.PathPattern))) {
    throw new Error('Travel routing already exists; do not overwrite it.');
  }
  next.Origins.Items.push({...structuredClone(app), Id: tripsOriginId, OriginPath: '/app-trips'});
  next.Origins.Quantity = next.Origins.Items.length;
  next.CacheBehaviors.Items ||= [];
  for (const PathPattern of tripsPatterns) {
    next.CacheBehaviors.Items.push({
      ...structuredClone(config.DefaultCacheBehavior),
      PathPattern,
      TargetOriginId: tripsOriginId,
      CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
      FunctionAssociations: {Quantity: 1, Items: [{FunctionARN: functionArn, EventType: 'viewer-request'}]},
    });
  }
  next.CacheBehaviors.Quantity = next.CacheBehaviors.Items.length;
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const snapshot = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  writeFileSync(process.argv[3], JSON.stringify(planCloudFront(snapshot.DistributionConfig), null, 2));
  console.log('Prepared additive travel origin and three path rules. Existing settings preserved.');
}
