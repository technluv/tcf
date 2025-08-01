/**
 * Standardized CLI Help Formatter
 * Follows Unix/Linux conventions for help output
 */

export interface CommandInfo {
  name: string;
  description: string;
  usage?: string;
  commands?: CommandItem[];
  options?: OptionItem[];
  examples?: string[];
  globalOptions?: OptionItem[];
}

export interface CommandItem {
  name: string;
  description: string;
  aliases?: string[];
}

export interface OptionItem {
  flags: string;
  description: string;
  defaultValue?: string;
  validValues?: string[];
}

export class HelpFormatter {
  private static readonly INDENT = '    ';
  private static readonly COLUMN_GAP = 2;
  private static readonly MIN_DESCRIPTION_COLUMN = 25;

  /**
   * Format main command help
   */
  static formatHelp(info: CommandInfo): string {
    const sections: string[] = [];

    // NAME section
    sections.push(this.formatSection('NAME', [`${info.name} - ${info.description}`]));

    // SYNOPSIS section
    if (info.usage) {
      sections.push(this.formatSection('SYNOPSIS', [info.usage]));
    }

    // COMMANDS section
    if (info.commands && info.commands.length > 0) {
      sections.push(this.formatSection('COMMANDS', this.formatCommands(info.commands)));
    }

    // OPTIONS section
    if (info.options && info.options.length > 0) {
      sections.push(this.formatSection('OPTIONS', this.formatOptions(info.options)));
    }

    // GLOBAL OPTIONS section
    if (info.globalOptions && info.globalOptions.length > 0) {
      sections.push(this.formatSection('GLOBAL OPTIONS', this.formatOptions(info.globalOptions)));
    }

    // EXAMPLES section
    if (info.examples && info.examples.length > 0) {
      sections.push(this.formatSection('EXAMPLES', info.examples));
    }

    // Footer
    if (info.commands && info.commands.length > 0) {
      sections.push(`Run '${info.name} <command> --help' for more information on a command.`);
    }

    return sections.join('\n\n');
  }

  /**
   * Format error message with usage hint
   */
  static formatError(error: string, command: string, usage?: string): string {
    const lines: string[] = [`Error: ${error}`, ''];

    if (usage) {
      lines.push(`Usage: ${usage}`);
    }

    lines.push(`Try '${command} --help' for more information.`);

    return lines.join('\n');
  }

  /**
   * Format validation error with valid options
   */
  static formatValidationError(
    value: string,
    paramName: string,
    validOptions: string[],
    command: string,
  ): string {
    return this.formatError(
      `'${value}' is not a valid ${paramName}. Valid options are: ${validOptions.join(', ')}.`,
      command,
    );
  }

  private static formatSection(title: string, content: string[]): string {
    return `${title}\n${content.map((line) => `${this.INDENT}${line}`).join('\n')}`;
  }

  private static formatCommands(commands: CommandItem[]): string[] {
    const maxNameLength = Math.max(
      this.MIN_DESCRIPTION_COLUMN,
      ...commands.map((cmd) => {
        const nameLength = cmd.name.length;
        const aliasLength = cmd.aliases ? ` (${cmd.aliases.join(', ')})`.length : 0;
        return nameLength + aliasLength;
      }),
    );

    return commands.map((cmd) => {
      let name = cmd.name;
      if (cmd.aliases && cmd.aliases.length > 0) {
        name += ` (${cmd.aliases.join(', ')})`;
      }
      const padding = ' '.repeat(maxNameLength - name.length + this.COLUMN_GAP);
      return `${name}${padding}${cmd.description}`;
    });
  }

  private static formatOptions(options: OptionItem[]): string[] {
    const maxFlagsLength = Math.max(
      this.MIN_DESCRIPTION_COLUMN,
      ...options.map((opt) => opt.flags.length),
    );

    return options.map((opt) => {
      const padding = ' '.repeat(maxFlagsLength - opt.flags.length + this.COLUMN_GAP);
      let description = opt.description;

      // Add default value
      if (opt.defaultValue !== undefined) {
        description += ` [default: ${opt.defaultValue}]`;
      }

      // Add valid values on next line if present
      if (opt.validValues && opt.validValues.length > 0) {
        const validValuesLine =
          ' '.repeat(maxFlagsLength + this.COLUMN_GAP) + `Valid: ${opt.validValues.join(', ')}`;
        return `${opt.flags}${padding}${description}\n${this.INDENT}${validValuesLine}`;
      }

      return `${opt.flags}${padding}${description}`;
    });
  }

  /**
   * Strip ANSI color codes and emojis from text
   */
  static stripFormatting(text: string): string {
    // Remove ANSI color codes
    text = text.replace(/\x1b\[[0-9;]*m/g, '');

    // Remove common emojis used in the CLI
    const emojiPattern =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1F6FF}]|[\u{1F680}-\u{1F6FF}]/gu;
    text = text.replace(emojiPattern, '').trim();

    // Remove multiple spaces
    text = text.replace(/\s+/g, ' ');

    return text;
  }
}
