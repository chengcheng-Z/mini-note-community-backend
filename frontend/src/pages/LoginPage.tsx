import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginWithCode, sendVerificationCode } from "@/api/auth";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import { isMockEnabled } from "@/mocks/config";
import { safeRedirect } from "@/lib/redirect";
import styles from "./LoginPage.module.css";

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const CODE_PATTERN = /^\d{6}$/;
const COUNTDOWN_SECONDS = 180;

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function handleSendCode() {
    setError("");
    setNotice("");

    if (!PHONE_PATTERN.test(phone)) {
      setError("请输入正确的手机号");
      return;
    }

    setSending(true);

    try {
      await sendVerificationCode(phone);
      setCountdown(COUNTDOWN_SECONDS);
      setNotice("验证码已发送，请注意查收");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "发送失败，请稍后重试");
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!PHONE_PATTERN.test(phone)) {
      setError("请输入正确的手机号");
      return;
    }

    if (!CODE_PATTERN.test(code)) {
      setError("请输入 6 位验证码");
      return;
    }

    setSubmitting(true);

    try {
      const token = await loginWithCode(phone, code);
      login(token);
      navigate(safeRedirect(searchParams.get("redirect")), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>登录</h1>
        <p className={styles.subtitle}>未注册的手机号验证后自动创建账号</p>
        {isMockEnabled() && (
          <p className={styles.hint}>演示模式：验证码固定为 123456</p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>手机号</span>
            <input
              className={styles.input}
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, ""))
              }
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>验证码</span>
            <div className={styles.codeRow}>
              <input
                className={styles.input}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
              />
              <button
                type="button"
                className={styles.sendButton}
                onClick={handleSendCode}
                disabled={sending || countdown > 0}
              >
                {countdown > 0
                  ? `${countdown}s`
                  : sending
                    ? "发送中"
                    : "获取验证码"}
              </button>
            </div>
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {notice && <p className={styles.notice}>{notice}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={submitting}
          >
            {submitting ? "登录中..." : "登录"}
          </button>
        </form>

        <Link to="/" className={styles.back}>
          先随便逛逛
        </Link>
      </div>
    </div>
  );
}
