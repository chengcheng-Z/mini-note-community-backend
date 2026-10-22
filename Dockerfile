FROM eclipse-temurin:17-jre-jammy

ARG JAR_FILE

ENV TZ=Asia/Shanghai \
    JAVA_TOOL_OPTIONS="-Xms96m -Xmx192m -XX:MaxMetaspaceSize=96m -Xss512k -XX:+UseSerialGC -Duser.timezone=Asia/Shanghai -Dfile.encoding=UTF-8"

WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app \
    && mkdir -p /app/logs \
    && chown -R app:app /app

COPY ${JAR_FILE} /app/app.jar
RUN chown app:app /app/app.jar

USER app

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
