# syntax=docker/dockerfile:1
ARG NODE_VARIANT=24-bookworm
FROM mcr.microsoft.com/devcontainers/javascript-node:${NODE_VARIANT}

ARG USERNAME=dev
ARG OLD_USERNAME=node

# Rename the image's existing uid/gid 1000 user rather than creating a second
# one. The uid never changes, so everything the base image already chowned to
# it -- the npm global prefix, oh-my-zsh, nvm -- keeps working untouched.
# visudo -c turns a bad sudoers edit into a build failure instead of a
# container you can't sudo in.
RUN set -eux; \
    groupmod -n "${USERNAME}" "${OLD_USERNAME}"; \
    usermod -l "${USERNAME}" -d "/home/${USERNAME}" -m "${OLD_USERNAME}"; \
    mv "/etc/sudoers.d/${OLD_USERNAME}" "/etc/sudoers.d/${USERNAME}"; \
    sed -i "s/^${OLD_USERNAME}\b/${USERNAME}/" "/etc/sudoers.d/${USERNAME}"; \
    chmod 0440 "/etc/sudoers.d/${USERNAME}"; \
    visudo -c -f "/etc/sudoers.d/${USERNAME}"

# Image-intrinsic env: static values that should apply however the container is
# launched (VS Code, `docker exec`, CI). Dynamic/per-host values like TZ stay in
# devcontainer.json so they can read ${localEnv:...}.
#
# CLAUDE_CONFIG_DIR matters for persistence: by default Claude Code keeps
# ~/.claude.json (per-project state, MCP servers, onboarding flags) in $HOME,
# *outside* the .claude directory. Pointing the config dir at .claude pulls that
# file into the named volume with the session transcripts.
ENV CLAUDE_CONFIG_DIR=/home/${USERNAME}/.claude \
    PNPM_HOME=/home/${USERNAME}/.local/share/pnpm \
    PATH=/home/${USERNAME}/.local/share/pnpm:${PATH} \
    NODE_OPTIONS=--max-old-space-size=4096 \
    DEVCONTAINER=true

# Pre-create volume mount points with correct ownership. Docker seeds a fresh
# named volume from whatever is at its mount point in the image, so this is what
# makes the volumes come up owned by dev instead of root.
#
# chown -R over the *parents*, not just the leaves: `install -d -o dev` applies
# the ownership only to the final component, so it would silently leave a
# freshly-created ~/.local and ~/.local/share owned by root. That breaks any
# tool that later wants its own directory under there -- Zed's remote server
# creates ~/.local/share/zed/server_state and exits 1 if it can't.
RUN mkdir -p \
      "/home/${USERNAME}/.claude" \
      "/home/${USERNAME}/.config/gh" \
      "/home/${USERNAME}/.local/share/pnpm" \
      /commandhistory \
    && chown -R "${USERNAME}:${USERNAME}" \
      "/home/${USERNAME}/.claude" \
      "/home/${USERNAME}/.config" \
      "/home/${USERNAME}/.local" \
      /commandhistory

# Prompt and completion. There is a feature for this
# (ghcr.io/devcontainers-extra/features/zsh-plugins) and it is not used on
# purpose: it runs the same `git clone --depth 1` and the same sed on .zshrc,
# but against each plugin's default branch with no revision pinned. Given the
# supply-chain posture in pnpm-workspace.yaml, cloning an unpinned HEAD into the
# image is the one thing worth avoiding here. Tags are pinned below, and the
# .git directories are dropped so they do not ride along in the image.
RUN git clone --depth 1 --branch v0.7.1 \
      https://github.com/zsh-users/zsh-autosuggestions \
      "/home/${USERNAME}/.oh-my-zsh/custom/plugins/zsh-autosuggestions" \
    && git clone --depth 1 --branch 0.8.0 \
      https://github.com/zsh-users/zsh-syntax-highlighting \
      "/home/${USERNAME}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" \
    && rm -rf "/home/${USERNAME}/.oh-my-zsh/custom/plugins/zsh-autosuggestions/.git" \
              "/home/${USERNAME}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/.git" \
    && sed -i 's/^plugins=(git)$/plugins=(git gh npm node zsh-interactive-cd zsh-autosuggestions zsh-syntax-highlighting)/' \
      "/home/${USERNAME}/.zshrc" \
    && grep -q 'zsh-syntax-highlighting' "/home/${USERNAME}/.zshrc" \
    && chown -R "${USERNAME}:${USERNAME}" \
      "/home/${USERNAME}/.oh-my-zsh/custom" "/home/${USERNAME}/.zshrc"

# Prompt: Powerlevel10k, pinned. No devcontainer feature exists for it -- checked
# the devcontainers, devcontainers-extra and devcontainers-contrib namespaces --
# so this follows the same pinned-clone pattern as the plugins above.
#
# Its shipped `lean` config is used as-is apart from one line. That config
# decorates with ordinary Unicode only (checked: zero Nerd Font private-use
# glyphs on active lines), so it renders faithfully in Zed's default font. The
# single edit flips POWERLEVEL9K_MODE off nerdfont-complete, so the segments
# that draw from p10k's built-in icon table -- node version, os icon -- pick
# ASCII rather than tofu. For the Pure style instead, swap p10k-lean.zsh for
# p10k-pure.zsh below; it is equally font-safe.
#
# gitstatusd is p10k's git backend. Left to itself it downloads its own binary
# from GitHub on the first interactive shell -- a surprise network fetch at
# runtime, and a degraded prompt with no network. It is fetched here instead, as
# the user that will run it, so it ships inside the image.
RUN P10K="/home/${USERNAME}/.oh-my-zsh/custom/themes/powerlevel10k" \
    && git clone --depth 1 --branch v1.9.1 \
      https://github.com/romkatv/powerlevel10k "$P10K" \
    && rm -rf "$P10K/.git" \
    && cp "$P10K/config/p10k-lean.zsh" "/home/${USERNAME}/.p10k.zsh" \
    && sed -i 's/^\(\s*\)typeset -g POWERLEVEL9K_MODE=.*/\1typeset -g POWERLEVEL9K_MODE=ascii/' \
      "/home/${USERNAME}/.p10k.zsh" \
    && grep -q 'POWERLEVEL9K_MODE=ascii' "/home/${USERNAME}/.p10k.zsh" \
    && sed -i 's|^ZSH_THEME=.*|ZSH_THEME="powerlevel10k/powerlevel10k"|' \
      "/home/${USERNAME}/.zshrc" \
    && printf '\n# Powerlevel10k prompt configuration.\n[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh\n' \
      >> "/home/${USERNAME}/.zshrc" \
    && su "${USERNAME}" -c "HOME=/home/${USERNAME} $P10K/gitstatus/install -f" \
    && ls "/home/${USERNAME}/.cache/gitstatus/"gitstatusd-* > /dev/null \
    && chown -R "${USERNAME}:${USERNAME}" \
      "/home/${USERNAME}/.oh-my-zsh/custom" "/home/${USERNAME}/.zshrc" \
      "/home/${USERNAME}/.p10k.zsh" "/home/${USERNAME}/.cache"

# Persist bash/zsh history across rebuilds via the /commandhistory volume.
# Symlinks beat a HISTFILE export because they survive any oh-my-zsh or user
# .rc override.
RUN touch /commandhistory/.bash_history /commandhistory/.zsh_history \
    && chown "${USERNAME}:${USERNAME}" /commandhistory/.bash_history /commandhistory/.zsh_history \
    && ln -sfn /commandhistory/.bash_history "/home/${USERNAME}/.bash_history" \
    && ln -sfn /commandhistory/.zsh_history "/home/${USERNAME}/.zsh_history" \
    && chown -h "${USERNAME}:${USERNAME}" \
      "/home/${USERNAME}/.bash_history" "/home/${USERNAME}/.zsh_history"
