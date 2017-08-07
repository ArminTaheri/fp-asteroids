import R from 'ramda';
import { Lens } from 'fantasy-lenses';
import { glMatrix, vec2, mat2 } from 'gl-matrix';

const {Just, Nothing} = Maybe;

// Vec2: Number -> Number -> Vec2
const Vec2 = R.curryN(2, vec2.fromValues);

// RigidBody: Vec2 -> Vec2 -> Number -> Number -> RigidBody
const RigidBody = R.curry((position, velocity, radius) => {
  return {position, velocity, radius};
});

// Input: [Number] -> Input
const Input = R.curry((keys) => {
  return {keys};
});

// angleToPosition: Number -> Number -> Vec2
const angleToPosition = distance => R.pipe(
  R.of,
  R.ap([Math.acos, Math.asin]),
  R.map(R.map(R.multiply(distance))),
  R.apply(Vec2)
);

// circlePoints: Number -> Number -> [Vec2]
const circlePoints = R.curry((distance, n) => {
  // Take number of astroids, n, and return n angles from 0 to 2PI
  const angles = R.map(R.compose(R.multiply(2 * Math.PI), R.divide(n)), R.range(0, n));
  // convert angles to positions
  const positions = R.map(angleToPosition(distance), angles);
});

// generateAstroidBelt: Number -> Number -> [RigidBody]
const generateAstroidBelt = R.curry((distance, n) => {
  const positions = circlePoints(distance, n);
  const velocities = R.map(R.always(Vec2(0, 0)), positions);
  const radii = R.map(R.always(10), positions);
  const zipped = R.map(i => [positions[i], velocities[i], radii[i]], R.range(0, n));
  return R.map(R.apply(RigidBody), zipped);
});

const PLAYER_RADIUS = 5;
const ASTEROID_RADIUS = 10;

const InitialGameState = {
  player: RigidBody(vec2.create(0, 0), vec2.create(0, 0), PLAYER_RADIUS),
  astroids: generateAstroidBelt(40, ASTEROID_RADIUS),
  bullets: []
}

// velocityCheck: Vec2 -> Vec2 -> Vec2 -> Vec2
const velocityCheck = R.curry((minVel, maxVel, velocity) => {
  const out = vec2.create();
  vec2.max(out, velocity, minVel);
  vec2.min(out, out, maxvel);
  return out;
});

// boundaryCheck: Number -> Number -> Vec2 -> Vec2
const boundaryCheck = R.curry((width, height, position) => {
  const out = vec2.create();
  const minPos = Vec2(-width/2, -height/2);
  vec2.sub(out, position, minPos);
  return out;
});

// integrationStep: Number -> Vec2 -> Vec2
const integrationStep = R.curry((dt, x, dxdt) => {
  const dx = vec2.create();
  vec2.scale(dx, dxdt, dt);
  const stepped = vec2.create();
  vec2.add(stepped, x, dx);
  return stepped;
});

// updateBody: Number -> Number -> Number -> RigidBody -> Vec2 -> RigidBody
const updateBody = R.curry((width, height, dt, body, force) => {
  const newVel = velocityCheck(
    Vec2(-5, -5),
    Vec2(5, 5),
    integrationStep(dt, body.velocity, force)
  );
  const newPos = boundaryCheck(
    width,
    height,
    integrationStep(dt, body.position, body.velocity)
  );
  return RigidBody(newPos, newVel, body.radius);
});

// clearCanvas: Canvas2DContext -> Number -> Number -> IO ()
const clearCanvas = R.curry((context, width, height) => {
  context.fillRect(0, 0, width, height);
}));

// drawLoop: Canvas2DContext -> [Vec2] -> IO ()
const drawLoop = R.curry((context, points) => {
  context.beginPath()
  R.apply(context.moveTo, points[0]);
  points.forEach((point) => {
    R.apply(context.lineTo, point);
  });
  R.apply(context.lineTo, points[0]);
  context.stroke();
}));

const offSetPosition = R.curry((offset, position) => {
  const out = vec2.create();
  vec2.add(out, offset, position);
  return out;
});


// drawFrame: Canvas2DContext -> GameState -> IO ()
const drawFrame = R.curry((context, state) => {
  const playerShape = circlePoints(PLAYER_RADIUS, 3);
  const asteroidShape = circlePoints(ASTEROID_RADIUS, 5);
  const playerShapeOffset = R.map(offSetPosition(state.player.position), triangle);
  const asteroidShapeOffset = asteroid =>
    R.map(offSetPosition(asteroid.position), asteroidShape);
  const asteroidShapeOffsets = R.map(asteroidShapeOffset, state.asteroids);
  drawLoop(context, playerShapeOffset),
  asteroidShapeOffsets.forEach(shape => {
    drawLoop(context, shape);
  });
});

const main = () => {
  const width = 800;
  const height = 600;
  const container = document.querySelector('#game-container');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);
};
