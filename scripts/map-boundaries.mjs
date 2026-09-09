// Preserve Natural Earth boundary coordinates while repairing failed Blender height samples.
// The exporter used exactly 0.69 when neither adjacent terrain mesh was hit.
export function repairBoundaryHeights(source) {
  let repaired = 0;
  const output = {};
  const same = (a, b) => a && b && a[0] === b[0] && a[2] === b[2];
  for (const [pair, segments] of Object.entries(source)) {
    const chains = [];
    for (let i = 0; i < segments.length; i += 2) {
      const a = [...segments[i]], b = [...segments[i + 1]];
      const last = chains.at(-1);
      if (last && same(last.at(-1), a)) last.push(b);
      else chains.push([a, b]);
    }
    for (const points of chains) {
      const distance = [0];
      for (let i = 1; i < points.length; i++) distance[i] = distance[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][2] - points[i - 1][2]);
      for (let i = 0; i < points.length;) {
        if (points[i][1] !== 0.69) { i++; continue; }
        const start = i;
        while (i < points.length && points[i][1] === 0.69) i++;
        const left = start > 0 ? start - 1 : null, right = i < points.length ? i : null;
        if (left === null && right === null) continue;
        for (let j = start; j < i; j++) {
          const t = left !== null && right !== null ? (distance[j] - distance[left]) / (distance[right] - distance[left] || 1) : 0;
          points[j][1] = left === null ? points[right][1] : right === null ? points[left][1] : points[left][1] + t * (points[right][1] - points[left][1]);
          repaired++;
        }
      }
    }
    output[pair] = chains.flatMap(points => points.slice(1).flatMap((p, i) => [points[i], p]));
  }
  return {output, repaired};
}

export function countryLabelAnchors(topology) {
  const {scale, translate} = topology.transform;
  const arcs = topology.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
  });
  const ring = indices => indices.flatMap(index => index < 0 ? [...arcs[~index]].reverse() : arcs[index]);
  const result = {};
  for (const feature of topology.objects.countries.geometries) {
    const polygons = feature.type === 'Polygon' ? [feature.arcs] : feature.type === 'MultiPolygon' ? feature.arcs : [];
    let largest = 0;
    for (const polygon of polygons) {
      const points = ring(polygon[0]); let twiceArea = 0, x = 0, y = 0;
      for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length], cross = a[0] * b[1] - b[0] * a[1];
        twiceArea += cross; x += (a[0] + b[0]) * cross; y += (a[1] + b[1]) * cross;
      }
      if (Math.abs(twiceArea) > largest) { largest = Math.abs(twiceArea); result[+feature.id] = [x / (3 * twiceArea), y / (3 * twiceArea)]; }
    }
  }
  return result;
}
