"""Create original synthesized audio assets for the H5.

This generator uses only mathematical waveforms and the note patterns below.
It does not read, copy, or include any recordings, samples, or third-party
melodies. Running it recreates every audio asset from scratch.
"""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path


SAMPLE_RATE = 22050
OUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "audio"


def note(midi: int) -> float:
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def empty(seconds: float) -> list[float]:
    return [0.0] * int(seconds * SAMPLE_RATE)


def add_pluck(buf: list[float], start: float, seconds: float, freq: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        attack = min(1.0, t / 0.012)
        envelope = attack * math.exp(-4.4 * t)
        wave_value = (
            math.sin(math.tau * freq * t)
            + 0.42 * math.sin(math.tau * freq * 2 * t)
            + 0.18 * math.sin(math.tau * freq * 3 * t)
        ) / 1.6
        buf[index] += wave_value * envelope * volume


def add_pad(buf: list[float], start: float, seconds: float, frequencies: tuple[float, ...], volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        fade = min(1.0, t / 0.55, max(0.0, (seconds - t) / 0.85))
        shimmer = 0.92 + 0.08 * math.sin(math.tau * 0.13 * t)
        value = sum(math.sin(math.tau * freq * t) for freq in frequencies) / len(frequencies)
        buf[index] += value * fade * shimmer * volume


def add_chime(buf: list[float], start: float, seconds: float, freq: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        envelope = min(1.0, t / 0.006) * math.exp(-5.2 * t)
        wave_value = (
            math.sin(math.tau * freq * t)
            + 0.32 * math.sin(math.tau * freq * 2.01 * t)
            + 0.15 * math.sin(math.tau * freq * 3.97 * t)
        ) / 1.47
        buf[index] += wave_value * envelope * volume


def add_soft_drum(buf: list[float], start: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(0.18 * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        envelope = math.exp(-19 * t)
        freq = 110 - 55 * min(1.0, t * 7)
        buf[index] += math.sin(math.tau * freq * t) * envelope * volume


def add_kick(buf: list[float], start: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(0.26 * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        envelope = math.exp(-18 * t)
        freq = 132 * math.exp(-13 * t) + 42
        click = math.sin(math.tau * 1500 * t) * math.exp(-75 * t) * 0.14
        buf[index] += (math.sin(math.tau * freq * t) * 0.92 + click) * envelope * volume


def add_clap(buf: list[float], start: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(0.13 * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        envelope = math.exp(-33 * t)
        # Deterministic pseudo-noise: no recording or sampled source.
        noise = math.sin(index * 12.9898) * math.sin(index * 78.233)
        buf[index] += noise * envelope * volume


def add_alarm_sweep(buf: list[float], start: float, seconds: float, low: float, high: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        progress = min(1.0, t / seconds)
        freq = high + (low - high) * progress
        envelope = min(1.0, t / 0.012) * max(0.0, 1.0 - progress) ** 0.55
        square = 1.0 if math.sin(math.tau * freq * t) >= 0 else -1.0
        buf[index] += (square * 0.72 + math.sin(math.tau * freq * t) * 0.28) * envelope * volume


def add_bass(buf: list[float], start: float, seconds: float, freq: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        progress = min(1.0, t / seconds)
        envelope = min(1.0, t / 0.008) * max(0.0, 1.0 - progress) ** 1.35
        pitch = freq * (1.025 - 0.025 * min(1.0, t / 0.045))
        value = math.sin(math.tau * pitch * t) + 0.22 * math.sin(math.tau * pitch * 2 * t)
        buf[index] += value / 1.22 * envelope * volume


def add_bright_lead(buf: list[float], start: float, seconds: float, freq: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        progress = min(1.0, t / seconds)
        envelope = min(1.0, t / 0.006) * math.exp(-2.8 * t) * max(0.0, 1.0 - progress) ** 0.55
        vibrato = 1.0 + 0.0026 * math.sin(math.tau * 7.2 * t)
        wave_value = (
            math.sin(math.tau * freq * vibrato * t)
            + 0.34 * math.sin(math.tau * freq * 2 * t)
            + 0.16 * math.sin(math.tau * freq * 3 * t)
            + 0.08 * math.sin(math.tau * freq * 5 * t)
        ) / 1.58
        buf[index] += wave_value * envelope * volume


def add_hat(buf: list[float], start: float, volume: float, open_hat: bool = False) -> None:
    begin = int(start * SAMPLE_RATE)
    seconds = 0.16 if open_hat else 0.065
    end = min(len(buf), begin + int(seconds * SAMPLE_RATE))
    decay = 27 if open_hat else 72
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        envelope = math.exp(-decay * t)
        noise = math.sin(index * 0.731) * math.sin(index * 1.177)
        metal = (
            math.sin(math.tau * 6100 * t)
            + math.sin(math.tau * 7900 * t)
            + math.sin(math.tau * 10300 * t)
        ) / 3
        buf[index] += (noise * 0.62 + metal * 0.38) * envelope * volume


def add_wood_click(buf: list[float], start: float, volume: float) -> None:
    begin = int(start * SAMPLE_RATE)
    end = min(len(buf), begin + int(0.09 * SAMPLE_RATE))
    for index in range(begin, end):
        t = (index - begin) / SAMPLE_RATE
        envelope = math.exp(-48 * t)
        value = math.sin(math.tau * 1280 * t) + 0.48 * math.sin(math.tau * 1920 * t)
        buf[index] += value / 1.48 * envelope * volume


def normalise(buf: list[float], ceiling: float = 0.88) -> list[float]:
    peak = max(0.001, max(abs(value) for value in buf))
    scale = ceiling / peak
    return [max(-1.0, min(1.0, value * scale)) for value in buf]


def write_wave(name: str, samples: list[float]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    pcm = b"".join(struct.pack("<h", int(sample * 32767)) for sample in normalise(samples))
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm)


def make_cover_bgm() -> None:
    # A calm, scenic opening loop: enough pulse to feel interactive without
    # competing with the illustrated Jiangxi landscape.
    bpm = 96
    beat = 60 / bpm
    bars = 8
    duration = bars * beat * 4
    buf = empty(duration)
    roots = [50, 45, 47, 43, 50, 45, 43, 45]
    chords = [
        (note(50), note(57), note(62), note(66)),
        (note(45), note(52), note(57), note(61)),
        (note(47), note(54), note(59), note(62)),
        (note(43), note(50), note(55), note(59)),
    ]

    for bar in range(bars):
        bar_start = bar * beat * 4
        root = roots[bar]
        chord = chords[bar % len(chords)]
        add_pad(buf, bar_start, beat * 4.25, chord, 0.064)
        for pulse in range(4):
            pulse_start = bar_start + pulse * beat
            chord_note = chord[(pulse + bar) % len(chord)]
            add_pluck(buf, pulse_start + beat * 0.16, beat * 1.18, chord_note * 2, 0.052)
        for beat_index in range(4):
            beat_start = bar_start + beat_index * beat
            if beat_index in (0, 2):
                add_soft_drum(buf, beat_start, 0.062 if beat_index == 0 else 0.042)
                add_bass(buf, beat_start, beat * 1.35, note(root), 0.082)
        if bar in (3, 7):
            add_wood_click(buf, bar_start + beat * 3.5, 0.022)

    melody = [
        74, None, None, 78, None, 81, None, None,
        76, None, 78, None, None, 74, None, None,
    ]
    step_time = beat / 2
    for step in range(bars * 8):
        pitch = melody[step % len(melody)]
        if pitch is None:
            continue
        start = step * step_time
        add_chime(buf, start, beat * 1.35, note(pitch), 0.11)
        if step % 16 == 0:
            add_chime(buf, start + 0.08, beat * 1.7, note(pitch + 12), 0.025)

    for index in range(len(buf)):
        t = index / SAMPLE_RATE
        edge = min(1.0, t / 0.32, max(0.0, (duration - t) / 0.34))
        buf[index] *= edge
    write_wave("cover-loop.wav", buf)


def make_game_bgm() -> None:
    # Moderate game pulse for a 30-second round. It should support attention,
    # not turn the timer into a frantic experience.
    bpm = 124
    beat = 60 / bpm
    bars = 8
    duration = bars * beat * 4
    buf = empty(duration)
    roots = [50, 47, 43, 45, 50, 47, 43, 45]
    chords = [
        (note(50), note(57), note(62), note(66)),
        (note(47), note(54), note(59), note(62)),
        (note(43), note(50), note(55), note(59)),
        (note(45), note(52), note(57), note(61)),
    ]

    for bar in range(bars):
        bar_start = bar * beat * 4
        root = roots[bar]
        chord = chords[bar % len(chords)]
        add_pad(buf, bar_start, beat * 4.15, chord, 0.041)
        for pulse in range(8):
            pulse_start = bar_start + pulse * beat / 2
            if pulse % 2 == 0:
                add_hat(buf, pulse_start, 0.021)
        for beat_index in range(4):
            beat_start = bar_start + beat_index * beat
            add_kick(buf, beat_start, 0.135 if beat_index in (0, 2) else 0.068)
            if beat_index in (1, 3):
                add_clap(buf, beat_start, 0.054)
            add_bass(buf, beat_start, beat * 0.78, note(root), 0.108)
            add_pluck(buf, beat_start + beat * 0.5, beat * 0.72, chord[(beat_index + 1) % len(chord)] * 2, 0.052)

    melody = [
        74, None, 78, None, 81, None, 78, 76,
        74, None, 78, 81, None, 83, 81, None,
    ]
    step_time = beat / 2
    for step in range(bars * 8):
        pitch = melody[step % len(melody)]
        if pitch is None:
            continue
        start = step * step_time
        add_bright_lead(buf, start, beat * 0.78, note(pitch), 0.085)
        if step % 16 in (0, 12):
            add_chime(buf, start, beat * 0.9, note(pitch + 12), 0.025)

    for index in range(len(buf)):
        t = index / SAMPLE_RATE
        edge = min(1.0, t / 0.38, max(0.0, (duration - t) / 0.34))
        buf[index] *= edge
    write_wave("game-loop.wav", buf)


def make_effects() -> None:
    correct = empty(0.48)
    add_clap(correct, 0.02, 0.10)
    add_wood_click(correct, 0.01, 0.12)
    add_chime(correct, 0.00, 0.44, note(76), 0.34)
    add_chime(correct, 0.12, 0.34, note(81), 0.32)
    add_chime(correct, 0.23, 0.25, note(86), 0.27)
    write_wave("correct.wav", correct)

    wrong = empty(0.62)
    add_kick(wrong, 0.00, 0.48)
    add_alarm_sweep(wrong, 0.02, 0.42, note(42), note(67), 0.36)
    add_alarm_sweep(wrong, 0.24, 0.34, note(37), note(57), 0.29)
    add_clap(wrong, 0.06, 0.16)
    write_wave("wrong.wav", wrong)

    start = empty(0.92)
    add_kick(start, 0.00, 0.34)
    add_kick(start, 0.32, 0.25)
    add_clap(start, 0.47, 0.10)
    for offset, pitch, volume in [(0.04, 69, 0.25), (0.17, 74, 0.28), (0.30, 78, 0.30), (0.43, 81, 0.33), (0.58, 86, 0.34)]:
        add_chime(start, offset, 0.48, note(pitch), volume)
    add_pad(start, 0.42, 0.44, (note(50), note(57), note(62)), 0.10)
    write_wave("start.wav", start)

    finish = empty(1.45)
    for offset, pitch in [(0.00, 69), (0.15, 74), (0.30, 78), (0.47, 81), (0.67, 86)]:
        add_chime(finish, offset, 0.76, note(pitch), 0.26)
    add_pad(finish, 0.48, 0.9, (note(50), note(57), note(62)), 0.05)
    write_wave("finish.wav", finish)


if __name__ == "__main__":
    make_cover_bgm()
    make_game_bgm()
    make_effects()
