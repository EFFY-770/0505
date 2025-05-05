let video;
let handPose;
let hands = [];
let circle = { x: 320, y: 240, radius: 50, isMoving: false };
let trail = []; // Stores the trail points

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // Draw the trail
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);
  beginShape();
  for (let point of trail) {
    vertex(point.x, point.y);
  }
  endShape();

  // Draw the circle
  fill(0, 0, 255);
  noStroke();
  circle(circle.x, circle.y, circle.radius * 2);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // Check if the index finger (keypoint 8) is touching the circle
        let indexFinger = hand.keypoints[8];
        if (dist(indexFinger.x, indexFinger.y, circle.x, circle.y) <= circle.radius) {
          // Update circle position to follow the index finger
          circle.x = indexFinger.x;
          circle.y = indexFinger.y;
          circle.isMoving = true;

          // Add the current position to the trail
          trail.push({ x: circle.x, y: circle.y });
        } else {
          circle.isMoving = false;
        }
      }
    }
  }

  // Limit the trail length to avoid excessive memory usage
  if (trail.length > 100) {
    trail.shift();
  }
}
