let status = 'ok';

export function setStatus(newStatus) {
  status = newStatus;
}

export function health() {
  return { status };
}
